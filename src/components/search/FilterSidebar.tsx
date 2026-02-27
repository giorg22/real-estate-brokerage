import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FilterSidebar = ({ data }: any) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8 sticky top-24">
      {/* 1. Condition Dropdown */}
      <FilterGroup label="Condition">
        <SelectOnData name="condition" options={data.condition} />
      </FilterGroup>

      {/* 2. Project Type */}
      <FilterGroup label="Project Type">
        <SelectOnData name="project" options={data.project} />
      </FilterGroup>

      {/* 3. Heating System */}
      <FilterGroup label="Heating">
        <SelectOnData name="heating" options={data.heating} />
      </FilterGroup>

      {/* 4. Multi-Select Characteristics (Bitwise Checkboxes) */}
      <FilterGroup label="Characteristics">
        <div className="grid grid-cols-1 gap-3 mt-3">
          {data.propertyCharacteristics.slice(0, 6).map((item: any) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox id={`char-${item.id}`} />
              <label htmlFor={`char-${item.id}`} className="text-sm font-medium leading-none">
                {item.name}
              </label>
            </div>
          ))}
        </div>
      </FilterGroup>

      <button className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
        Show Results
      </button>
    </div>
  );
};

const FilterGroup = ({ label, children }: any) => (
  <div>
    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</h4>
    {children}
  </div>
);

const SelectOnData = ({ options, name }: any) => (
  <Select>
    <SelectTrigger className="w-full bg-slate-50 border-none h-11">
      <SelectValue placeholder="All" />
    </SelectTrigger>
    <SelectContent>
      {options.map((opt: any) => (
        <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);