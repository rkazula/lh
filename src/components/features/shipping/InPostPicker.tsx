import React, { useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PickupPoint } from '@/types/api';
import { Spinner } from '@/components/ui/Spinner';

declare global {
  interface Window {
    // Typing the custom InPost event details
    onInPostPointSelect?: (point: any) => void;
  }
}

interface InPostPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (point: PickupPoint) => void;
}

export function InPostPicker({ open, onClose, onSelect }: InPostPickerProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Define the global callback function expected by the widget configuration
    // We attach it to window so the custom element can find it.
    window.onInPostPointSelect = (point: any) => {
      console.log('InPost Selected:', point);
      
      const normalizedPoint: PickupPoint = {
        provider: 'INPOST',
        id: point.name, // InPost uses 'name' as ID usually (e.g. KRA01M)
        name: `Paczkomat ${point.name}`,
        address: {
          line1: `${point.address_details.street} ${point.address_details.building_number}`,
          line2: `${point.address_details.post_code} ${point.address_details.city}`,
        },
        lat: point.latitude,
        lng: point.longitude,
        type: 'LOCKER'
      };
      
      onSelect(normalizedPoint);
      onClose();
    };

    return () => {
      // Cleanup global handler
      delete window.onInPostPointSelect;
    };
  }, [open, onClose, onSelect]);

  return (
    <Modal open={open} onClose={onClose} title="Select Paczkomat" className="h-[600px]">
      <div className="w-full h-full bg-white relative">
        {/* 
          InPost Geowidget Custom Element 
          Ref: https://docs.inpost.pl/integrowanie-z-geowidgetem
        */}
        <inpost-geowidget
          token={import.meta.env.VITE_INPOST_GEOWIDGET_TOKEN}
          language="pl"
          config="parcelCollect"
          onpoint="onInPostPointSelect" 
          // We use the attribute 'onpoint' which maps to the window function name
        ></inpost-geowidget>
        
        {/* Fallback/Loader if script takes time */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <Spinner size="lg" />
        </div>
      </div>
    </Modal>
  );
}