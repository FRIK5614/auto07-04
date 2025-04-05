
import { useState, useEffect } from "react";
import { CarFilter } from "@/types/car";
import { useCars } from "@/hooks/useCars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import {
  getAllBrands,
  getAllBodyTypes,
  getAllModels,
  getPriceRange,
  getEngineTypes,
  getDrivetrains,
  getCountries
} from "@/data/carsData";

const SearchFilters = () => {
  const { filter, setFilter } = useCars();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState<CarFilter>(filter);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);

  const brands = getAllBrands();
  const models = getAllModels();
  const bodyTypes = getAllBodyTypes();
  const engineTypes = getEngineTypes();
  const drivetrains = getDrivetrains();
  const countries = getCountries();
  const { min: minPriceData, max: maxPriceData } = getPriceRange();

  // Initialize price range from data
  useEffect(() => {
    setMinPrice(minPriceData);
    setMaxPrice(maxPriceData);
    setPriceRange([minPriceData, maxPriceData]);
    
    setLocalFilter(prev => ({
      ...prev,
      priceRange: {
        min: minPriceData,
        max: maxPriceData
      }
    }));
  }, [minPriceData, maxPriceData]);

  const toggleFilter = (
    filterName: keyof CarFilter,
    value: string | number | boolean
  ) => {
    setLocalFilter(prev => {
      const current = prev[filterName] as any[];
      if (!current) {
        return {
          ...prev,
          [filterName]: [value]
        };
      }

      const exists = current.includes(value);
      if (exists) {
        return {
          ...prev,
          [filterName]: current.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterName]: [...current, value]
        };
      }
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setLocalFilter(prev => ({
      ...prev,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const resetFilters = () => {
    setLocalFilter({});
    setPriceRange([minPriceData, maxPriceData]);
  };

  const applyFilters = () => {
    setFilter(localFilter);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const isFilterEmpty = Object.keys(localFilter).length === 0 || 
    (Object.keys(localFilter).length === 1 && localFilter.priceRange && 
     localFilter.priceRange.min === minPriceData && 
     localFilter.priceRange.max === maxPriceData);

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden p-4 bg-white sticky top-16 z-40 shadow-sm">
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          variant="outline" 
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </span>
          {Object.keys(filter).length > 0 && (
            <span className="bg-auto-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {Object.keys(filter).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      <div className={`
        md:block
        ${isOpen ? 'fixed inset-0 z-50 bg-white md:relative md:bg-transparent' : 'hidden'}
        md:sticky md:top-24 md:h-[calc(100vh-6rem)] md:overflow-y-auto
        p-4 md:p-0 md:pr-6 pb-6
      `}>
        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <Accordion type="multiple" defaultValue={["brand", "price", "body", "country"]}>
            {/* Brand Filter */}
            <AccordionItem value="brand">
              <AccordionTrigger className="text-base font-medium">Марка</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brand-${brand}`} 
                        checked={(localFilter.brands || []).includes(brand)}
                        onCheckedChange={() => toggleFilter('brands', brand)}
                      />
                      <Label 
                        htmlFor={`brand-${brand}`}
                        className="cursor-pointer"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Body Type Filter */}
            <AccordionItem value="body">
              <AccordionTrigger className="text-base font-medium">Тип кузова</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {bodyTypes.map(bodyType => (
                    <div key={bodyType} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`body-${bodyType}`} 
                        checked={(localFilter.bodyTypes || []).includes(bodyType)}
                        onCheckedChange={() => toggleFilter('bodyTypes', bodyType)}
                      />
                      <Label 
                        htmlFor={`body-${bodyType}`}
                        className="cursor-pointer"
                      >
                        {bodyType}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Country Filter */}
            <AccordionItem value="country">
              <AccordionTrigger className="text-base font-medium">Страна происхождения</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {countries.map(country => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`country-${country}`} 
                        checked={(localFilter.countries || []).includes(country)}
                        onCheckedChange={() => toggleFilter('countries', country)}
                      />
                      <Label 
                        htmlFor={`country-${country}`}
                        className="cursor-pointer"
                      >
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price Range Filter */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-base font-medium">Цена</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Slider
                    defaultValue={[minPriceData, maxPriceData]}
                    min={minPriceData}
                    max={maxPriceData}
                    step={50000}
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    className="py-4"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-1/2">
                      <Label htmlFor="min-price" className="text-xs mb-1 block">
                        От
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => 
                          handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="max-price" className="text-xs mb-1 block">
                        До
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => 
                          handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Engine Type Filter */}
            <AccordionItem value="engine">
              <AccordionTrigger className="text-base font-medium">Двигатель</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {engineTypes.map(engineType => (
                    <div key={engineType} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`engine-${engineType}`} 
                        checked={(localFilter.engineTypes || []).includes(engineType)}
                        onCheckedChange={() => toggleFilter('engineTypes', engineType)}
                      />
                      <Label 
                        htmlFor={`engine-${engineType}`}
                        className="cursor-pointer"
                      >
                        {engineType}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Drivetrain Filter */}
            <AccordionItem value="drivetrain">
              <AccordionTrigger className="text-base font-medium">Привод</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {drivetrains.map(drivetrain => (
                    <div key={drivetrain} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`drivetrain-${drivetrain}`} 
                        checked={(localFilter.drivetrains || []).includes(drivetrain)}
                        onCheckedChange={() => toggleFilter('drivetrains', drivetrain)}
                      />
                      <Label 
                        htmlFor={`drivetrain-${drivetrain}`}
                        className="cursor-pointer"
                      >
                        {drivetrain}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* New Car Filter */}
            <AccordionItem value="new">
              <AccordionTrigger className="text-base font-medium">Новизна</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-car" 
                      checked={localFilter.isNew === true}
                      onCheckedChange={() => 
                        setLocalFilter(prev => ({
                          ...prev,
                          isNew: prev.isNew === true ? undefined : true
                        }))
                      }
                    />
                    <Label 
                      htmlFor="new-car"
                      className="cursor-pointer"
                    >
                      Только новые автомобили
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              onClick={applyFilters} 
              className="bg-auto-blue-600 hover:bg-auto-blue-700"
            >
              Применить фильтры
            </Button>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={isFilterEmpty}
            >
              Сбросить фильтры
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchFilters;
