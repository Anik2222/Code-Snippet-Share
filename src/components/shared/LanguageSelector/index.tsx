'use client'

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMonaco } from "@monaco-editor/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange: (language: string) => void;
}

//Define a type for the Monaco language objects
type MonacoLanguage = {
  id: string;
  extensions?: string[];
  aliases?: string[];
};

export const LanguageSelector = ({ value, onChange }: Props) => {
    const monaco = useMonaco();

    const [open, setOpen] = useState<boolean>(false)
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');

    useEffect(() => {
        setSelectedLanguage(value || '');
    }, [value]);
    
    const allLanguages = useMemo(() => {
        const languages = monaco?.languages?.getLanguages();
        if(languages) return languages as MonacoLanguage[];
        
        return [];
    }, [monaco])
    
    const handleChange = (currentValue: string) => {
      setSelectedLanguage (currentValue === selectedLanguage ? '' : currentValue);
      if (onChange) {
        onChange(currentValue);
      }

      setOpen(false);
    };
    

    return (
        <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="min-w-[200px] w-full justify-between capitalize"
        >
          {selectedLanguage
            ? allLanguages.find((language: MonacoLanguage) => language.id === selectedLanguage)?.id
            : "Select language..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] w-full p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {allLanguages.map((language: MonacoLanguage) => (
                <CommandItem
                  className="capitalize"
                  key={language.id}
                  value={language.id}
                  onSelect={handleChange}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLanguage === language.id 
                      ? "opacity-100" 
                      : "opacity-0"
                    )}
                  />
                  {language.id}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    );
};