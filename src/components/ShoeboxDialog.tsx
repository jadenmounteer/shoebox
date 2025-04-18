import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface ShoeboxDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
  initialData?: {
    name: string;
    description: string;
  };
  mode: "create" | "edit";
}

const ShoeboxDialog: React.FC<ShoeboxDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "create" ? "Create New Shoebox" : "Edit Shoebox"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shoebox Name"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ShoeboxDialog;
