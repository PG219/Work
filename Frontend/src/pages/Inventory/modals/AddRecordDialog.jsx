import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AddRecordDialog = ({ open, onOpenChange, newItem, setNewItem, onAdd }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Record</DialogTitle>
          <DialogDescription>Create a new inventory record.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="col-span-3"
            />
          </div>

          {/* Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vendor">Vendor</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">Contact</Label>
            <Input
              id="contact"
              value={newItem.contact}
              onChange={(e) => setNewItem({ ...newItem, contact: e.target.value })}
              className="col-span-3"
            />
          </div>

          {/* AI Usage */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="aiUsage" className="text-right">AI Usage</Label>
            <Select
              value={newItem.aiUsage}
              onValueChange={(value) =>
                setNewItem({ ...newItem, aiUsage: value, status: value.toLowerCase() })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Incomplete">Incomplete</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAdd}>Add Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordDialog;
