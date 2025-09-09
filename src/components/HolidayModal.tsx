import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Holiday, HolidayFormData } from "@/types/task";

interface HolidayModalProps {
  holiday: Holiday | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (holidayData: HolidayFormData) => void;
  isCreating?: boolean;
  isSaving?: boolean;
}

interface HolidayFormErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export function HolidayModal({ holiday, isOpen, onClose, onSave, isCreating, isSaving = false }: HolidayModalProps) {
  const [formData, setFormData] = useState<HolidayFormData>({
    name: '',
    // date: new Date(),
    startDate: new Date(),
    endDate: new Date()
  });
  // const [errors, setErrors] = useState<Partial<HolidayFormData>>({});
  const [errors, setErrors] = useState<HolidayFormErrors>({});

  useEffect(() => {
    if (isOpen) {
      if (holiday && !isCreating) {
        setFormData({
          name: holiday.name,
          // date: holiday.date,
          startDate: holiday.startDate,
          endDate: holiday.endDate
        });
      } else {
        setFormData({
          name: '',
          // date: new Date(),
          startDate: new Date(),
          endDate: new Date()
        });
      }
      setErrors({});
    }
  }, [isOpen, holiday, isCreating]);

  const validateForm = (): boolean => {
    // const newErrors: Partial<HolidayFormData> = {};
    const newErrors: HolidayFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Holiday name is required';
    }

    if (formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Add Gazetted Holiday' : 'Edit Holiday'}
          </DialogTitle>
          <DialogDescription>
            {isCreating ? 'Add a new gazetted holiday to the system.' : 'Edit holiday details.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter holiday name"
            />
            {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
          </div>

          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: new Date(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: new Date(e.target.value) })
                }
              />
              {errors.endDate && <span className="text-sm text-destructive">{errors.endDate}</span>}
            </div>


          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-current" />
                Saving...
              </>
            ) : (
              isCreating ? 'Add Holiday' : 'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}