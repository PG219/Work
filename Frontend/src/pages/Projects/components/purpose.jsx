import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Button, IconButton, Tooltip, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Delete } from "@mui/icons-material";
import { getPurposeData, savePurposeDataBulk } from "@/services/elements";
import { getThirdParties, createThirdParty, deleteThirdParty } from "@/services/thirdPartyService";
import { useEffect, useState } from "react";
import AddDataElementModal from "../modals/addDataElementsModal";
import ThirdPartyModal from "../modals/ThirdPartyModal";

const Purpose = ({ projectId }) => {
  const token = localStorage.getItem("token");

  const [dataElements, setDataElements] = useState([]);
  const [thirdPartyData, setThirdPartyData] = useState([]);

  const [openDataModal, setOpenDataModal] = useState(false);
  const [openThirdPartyModal, setOpenThirdPartyModal] = useState(false);

  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const categoryData = {
    "Account Login Credentials": ["Username", "Password", "Security Question", "OTP"],
    "Additional": ["Notes", "Tags", "Reference ID"],
    "AI Use Case Forms": ["Input Data", "Training Dataset", "Output Samples"],
    "Alternative Data": ["Social Media", "Web Scraped Data", "External API Data"],
    "Assets": ["Images", "Videos", "Documents", "Source Code"],
    "Audience": ["Customers", "Employees", "Partners", "Vendors"],
  };

  const loadInitialData = async () => {
    if (!projectId || !token) return;

    setIsDataLoading(true);
    try {
      // Fetch both data elements and third parties in parallel
      const [elementsRes, thirdPartiesRes] = await Promise.all([
        getPurposeData(projectId, token),
        getThirdParties(projectId, token),
      ]);

      const elementsArray = Array.isArray(elementsRes) ? elementsRes : elementsRes ? [elementsRes] : [];
      setDataElements(
        elementsArray.map((el) => ({
          id: el.elementId || el._id,
          category: el.category,
          elementName: el.elementName,
        }))
      );

      setThirdPartyData(thirdPartiesRes.map(tp => ({ ...tp, id: tp.id ||tp._id })));

    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId, token]);

  const handleAddDataElements = async () => {
    const elementsToSend = Object.entries(selectedItems).flatMap(([category, items]) =>
      items.map((elementName) => ({ category, elementName }))
    );

    if (elementsToSend.length === 0) {
      setOpenDataModal(false);
      return;
    }

    setLoading(true);
    try {
      await savePurposeDataBulk(projectId, elementsToSend, token);
      await loadInitialData(); // Reload all data
    } catch (error) {
      console.error("Failed to save purpose data (bulk):", error);
    } finally {
      setLoading(false);
      setOpenDataModal(false);
      setSelectedItems({});
    }
  };

  const handleAddThirdParty = async (newPartyData) => {
    setLoading(true);
    try {
      const payload = { ...newPartyData, projectId };
      await createThirdParty(payload, token);
      await loadInitialData();
    } catch (error) {
      console.error("Failed to create third party:", error);
    } finally {
      setLoading(false);
      setOpenThirdPartyModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this data element?")) {
      return;
    }
    try {
      // Assumes a 'deletePurposeData' service function exists
      await deletePurposeData(projectId, id, token);
      await loadInitialData();
    } catch (error) {
      console.error(`Failed to delete data element with ID ${id}:`, error);
    }
  };

  const handleDeleteThirdParty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this third party?")) {
      return;
    }
    try {
      await deleteThirdParty(id, token);
      await loadInitialData();
    } catch (error) {
      console.error(`Failed to delete third party with ID ${id}:`, error);
    }
  };
  
  if (!projectId) {
    return (
      <div className="flex justify-center items-center p-8">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 bg-gray-50 min-h-screen gap-8">
      {/* Data Elements Section */}
      <div className="flex flex-col border rounded-2xl p-6 w-full shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Elements</h1>
            <p className="text-gray-500 text-sm">
              Add data elements to associate with the business process.
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDataModal(true)}
            sx={{ textTransform: "none", px: 2.5, borderRadius: "8px", fontWeight: 600 }}
          >
            New Data Element
          </Button>
        </div>
        <div className="overflow-x-auto mb-8">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-[120px]">E-ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Element Name</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isDataLoading ? (
                 <TableRow><TableCell colSpan={4} className="text-center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : dataElements.length > 0 ? (
                dataElements.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{item.id.slice(-6)}</TableCell>
                    <TableCell>{item.elementName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: "#dc2626", "&:hover": { backgroundColor: "#fee2e2" } }} onClick={() => handleDelete(item.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                    No data elements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Third Party Section */}
      <div className="flex flex-col border rounded-2xl p-6 w-full shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Third Party</h2>
            <p className="text-gray-500 text-sm mb-4">
              List of third-party entities associated with this project.
            </p>
          </div>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenThirdPartyModal(true)} sx={{ textTransform: "none", px: 2.5, borderRadius: "8px", fontWeight: 600 }}>
            New Third Party
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-[120px]">TP-ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Website URL</TableHead>
              <TableHead>Industry Sector</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isDataLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : thirdPartyData.length > 0 ? (
                thirdPartyData.map((tp) => (
                  <TableRow key={tp.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{tp._id.slice(-6)}</TableCell>
                    <TableCell>{tp.name}</TableCell>
                    <TableCell>{tp.type}</TableCell>
                    <TableCell>{Array.isArray(tp.role) ? tp.role.join(', ') : tp.role}</TableCell>
                    <TableCell><a href={tp.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tp.website}</a></TableCell>
                    <TableCell>{Array.isArray(tp.industry) ? tp.industry.join(', ') : tp.industry}</TableCell>
                    <TableCell className="text-right">
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: "#dc2626", "&:hover": { backgroundColor: "#fee2e2" } }} onClick={() => handleDeleteThirdParty(tp.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-6">No third-party data available.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <AddDataElementModal
        open={openDataModal}
        onClose={() => setOpenDataModal(false)}
        onSave={handleAddDataElements}
        loading={loading}
        categoryData={categoryData}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <ThirdPartyModal
        open={openThirdPartyModal}
        onClose={() => setOpenThirdPartyModal(false)}
        onSave={handleAddThirdParty}
        loading={loading}
      />
    </div>
  );
};

export default Purpose;