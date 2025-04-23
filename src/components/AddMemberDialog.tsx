
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddMemberDialogProps {
  onAdd: (email: string) => Promise<void>;
  isLoading?: boolean;
}

const AddMemberDialog = ({ onAdd, isLoading }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    try {
      await onAdd(email.trim());
      setEmail("");
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || "Could not add member.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Label htmlFor="email">Student Email</Label>
          <Input
            id="email"
            placeholder="student@university.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-projexia-600 hover:bg-projexia-700"
            onClick={handleAdd}
            loading={isLoading}
            disabled={isLoading}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;

