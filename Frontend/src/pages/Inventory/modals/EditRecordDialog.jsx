import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EditRecordDialog = ({ open, onOpenChange, selectedItems, editingItem, onUpdate }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            {selectedItems.length > 1
              ? `Edit ${selectedItems.length} selected records`
              : `Edit ${editingItem?.name || "record"}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 1
              ? "Bulk edit functionality would be implemented here"
              : "Individual edit functionality would be implemented here"}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordDialog;
