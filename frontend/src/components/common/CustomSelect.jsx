import { useState, useRef, useEffect } from"react";
const CustomSelect = ({
 options,
 value,
 onChange,
 placeholder ="Pilih...",
 icon,
 className ="",
 dropdownClassName ="",
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef(null);
 const selectedOption = options.find((opt) => opt.value === value);
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);
 return (
 <div className={`relative ${className}`} ref={dropdownRef}>
 {""}
 <div
 className="w-full flex items-center justify-between cursor-pointer"
 onClick={() => setIsOpen(!isOpen)}
 >
 {""}
 <div className="flex items-center gap-2 overflow-hidden flex-1">
 {""}
 {icon && (
 <span className="material-symbols-outlined text-outline text-[20px]">
 {""}
 {icon}{""}
 </span>
 )}{""}
 <span className="truncate block font-body-md text-on-surface">
 {""}
 {selectedOption ? selectedOption.label : placeholder}{""}
 </span>{""}
 </div>{""}
 <span
 className={`material-symbols-outlined text-outline transition-transform duration-300 ${isOpen ?"rotate-180" :""}`}
 >
 {""}
 expand_more{""}
 </span>{""}
 </div>{""}
 {isOpen && (
 <div
 className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-surface-container-lowest [#1a2333] shadow-lg border border-outline-variant/30 overflow-hidden backdrop-blur-xl animate-fade-in ${dropdownClassName}`}
 >
 {""}
 <ul className="max-h-60 overflow-y-auto custom-scrollbar p-1">
 {""}
 {options.map((opt) => (
 <li
 key={opt.value}
 className={`px-4 py-2.5 mx-1 my-0.5 rounded-xl cursor-pointer text-sm font-label-md transition-colors flex items-center justify-between ${value === opt.value ?"bg-primary text-white" :"text-on-surface hover:bg-surface-variant :bg-white/10"}`}
 onClick={() => {
 onChange(opt.value);
 setIsOpen(false);
 }}
 >
 {""}
 {opt.label}{""}
 {value === opt.value && (
 <span className="material-symbols-outlined text-[16px]">
 check
 </span>
 )}{""}
 </li>
 ))}{""}
 </ul>{""}
 </div>
 )}{""}
 </div>
 );
};
export default CustomSelect;
