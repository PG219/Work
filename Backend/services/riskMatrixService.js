import RiskMatrixRisk from '../models/Risks.js';

class RiskMatrixService {
  /**
   * Store individual risks from risk matrix agent
   */
  static async storeRisks(data, userId) {
    try {
      const { projectId, sessionId } = data;
      let { parsedRisks } = data;

      if (!parsedRisks || !Array.isArray(parsedRisks) || parsedRisks.length === 0) {
        throw new Error('No risks to store');
      }
      
      parsedRisks = parsedRisks.slice(1);
      // Prepare risks for insertion
      const risksToInsert = parsedRisks.map(risk => ({
        sessionId,
        projectId,
        riskAssessmentId:risk.risk_id,
        riskName: risk.risk_name,
        riskOwner: risk.risk_owner,
        severity: risk.severity,
        justification: risk.justification,
        mitigation: risk.mitigation,
        targetDate: risk.target_date ? new Date(risk.target_date) : null,
        createdBy: userId
      }));
      
      const insertedRisks = await RiskMatrixRisk.insertMany(risksToInsert);
      
      // Populate createdBy for response
      await RiskMatrixRisk.populate(insertedRisks, { path: 'createdBy', select: 'name surname email' });
      
      return {
        sessionId,
        risksCount: insertedRisks.length,
        risks: insertedRisks
      };
    } catch (error) {
      console.error('Error in storeRisks:', error);
      throw error;
    }
  }
  
  /**
   * Get risks for a specific assessment
   */
  static async getRisksByAssessment(riskAssessmentId) {
    try {
      const risks = await RiskMatrixRisk.find({ 
        riskAssessmentId, 
        isActive: true 
      })
      .populate('createdBy', 'name surname email')
      .sort({ severity: -1, createdAt: -1 })
      .lean();
      
      return risks;
    } catch (error) {
      console.error('Error in getRisksByAssessment:', error);
      throw error;
    }
  }
  
  /**
   * Get risks for a specific session
   */
  static async getRisksBySession(sessionId) {
    try {
      const risks = await RiskMatrixRisk.find({ 
        sessionId, 
        isActive: true 
      })
      .populate('createdBy', 'name surname email')
      .sort({ severity: -1, createdAt: -1 })
      .lean();
      
      return risks;
    } catch (error) {
      console.error('Error in getRisksBySession:', error);
      throw error;
    }
  }
  
  /**
   * Get risks for a specific project with pagination
   */
  static async getRisksByProject(projectId, page = 1, limit = 20, severity = null) {
    try {
      const query = { projectId, isActive: true };
      if (severity) {
        query.severity = parseInt(severity);
      }
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const risks = await RiskMatrixRisk.find({projectId})
        .populate('createdBy', 'name surname email')
        .sort({ severity: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      const total = await RiskMatrixRisk.countDocuments(query);
      return {
        risks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error in getRisksByProject:', error);
      throw error;
    }
  }
  
  /**
   * Get risk statistics
   */
  static async getRiskStatistics(projectId = null) {
    try {
      const query = { isActive: true };
      if (projectId) {
        query.projectId = projectId;
      }
      
      const totalRisks = await RiskMatrixRisk.countDocuments(query);
      
      const severityStats = await RiskMatrixRisk.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]);
      
      // Convert severity stats to riskLevels object
      const riskLevels = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        'Very Low': 0
      };
      
      severityStats.forEach(stat => {
        const severity = stat._id;
        const count = stat.count;
        
        if (severity === 5) riskLevels.Critical = count;
        else if (severity === 4) riskLevels.High = count;
        else if (severity === 3) riskLevels.Medium = count;
        else if (severity === 2) riskLevels.Low = count;
        else if (severity === 1) riskLevels['Very Low'] = count;
      });
      
      const ownerStats = await RiskMatrixRisk.aggregate([
        { $match: query },
        { $group: { _id: '$riskOwner', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const recentRisks = await RiskMatrixRisk.find(query)
        .populate('createdBy', 'name surname email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      return {
        totalRisks,
        riskLevels,
        severityStats,
        ownerStats,
        recentRisks
      };
    } catch (error) {
      console.error('Error in getRiskStatistics:', error);
      throw error;
    }
  }
  
  /**
   * Update a risk
   */
  static async updateRisk(riskId, updateData) {
    try {
      const updatedRisk = await RiskMatrixRisk.findByIdAndUpdate(
        riskId,
        {
          ...updateData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'name surname email');
      
      if (!updatedRisk) {
        throw new Error('Risk not found');
      }
      
      return updatedRisk;
    } catch (error) {
      console.error('Error in updateRisk:', error);
      throw error;
    }
  }
  
  /**
   * Delete a risk (soft delete)
   */
  static async deleteRisk(riskId) {
    try {
      const deletedRisk = await RiskMatrixRisk.findByIdAndUpdate(
        riskId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );
      
      if (!deletedRisk) {
        throw new Error('Risk not found');
      }
      
      return { message: 'Risk deleted successfully' };
    } catch (error) {
      console.error('Error in deleteRisk:', error);
      throw error;
    }
  }

  /**
   * Add a single new risk
   */
  static async addRisk(riskData) {
    try {
      const newRisk = new RiskMatrixRisk({
        ...riskData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedRisk = await newRisk.save();
      await RiskMatrixRisk.populate(savedRisk, { path: 'createdBy', select: 'name surname email' });
      
      return savedRisk;
    } catch (error) {
      console.error('Error in addRisk:', error);
      throw error;
    }
  }
}

export default RiskMatrixService; 