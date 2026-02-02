"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Types
export interface ImageItem {
  id: string;
  file: File;
  url?: string;
  publicId?: string;
  isUploading: boolean;
}

interface ImageUploaderProps {
  previews: ImageItem[];
  setPreviews: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

// 2. Main Wrapper Component
export function ImageUploader({ previews, setPreviews }: ImageUploaderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPreviews((items: ImageItem[]) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id: string) => {
    setPreviews((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={previews} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((item, index) => (
            <SortablePhoto 
              key={item.id} 
              item={item} 
              index={index} 
              onRemove={removeImage} 
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// 3. Individual Photo Component (Internal to this file)
export function SortablePhoto({ 
  item, 
  index, 
  onRemove 
}: { 
  item: ImageItem; 
  index: number; 
  onRemove: (id: string) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group border rounded-xl p-2 bg-card shadow-sm",
        isDragging && "ring-2 ring-primary opacity-50"
      )}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <img
          src={item.url || (item.file ? URL.createObjectURL(item.file) : "")}
          className={cn("object-cover w-full h-full", item.isUploading && "opacity-30")}
          alt="preview"
        />
        
        {/* Drag Handle Overlay */}
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab bg-black/20 transition-opacity"
        >
          <GripVertical className="text-white h-8 w-8" />
        </div>

        {/* Remove Button */}
        {!item.isUploading && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 z-10 hover:scale-110 transition-transform"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Loading Spinner */}
        {item.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary h-6 w-6" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full",
            index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          {index === 0 ? "Cover" : `Photo ${index + 1}`}
        </span>
      </div>
    </div>
  );
}