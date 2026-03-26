import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const numericNanoid = customAlphabet('0123456789', 3);

const DataElementSchema = new mongoose.Schema(
  {
    elementId: {
      type: String,
      required: true,
      unique: true,
      default: () => `E-${numericNanoid()}`
    },
    elementName: {
      type: String,
      required: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "User"
    },
    projectId: { 
      type: String,
      required: true
      // ref: "Project" // Only if you'll populate with localField/foreignField
    },
    category: {
      type: String,
      required: true
    }
  },
  { timestamps: true,collection: 'Data Elements' }
);


export default mongoose.model("DataElement", DataElementSchema);
