
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchFiltersModal = ({ isOpen, onClose }: SearchFiltersModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold">Подбор автомобиля по параметрам</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="py-4">
          <SearchFilters closeModal={onClose} isInModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchFiltersModal;
