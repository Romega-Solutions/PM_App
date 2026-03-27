import React from "react";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import { Search } from "lucide-react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function LocationSearch({ value, onChange, placeholder = "Type your city name..." }: Props) {
  return (
    <CustomTextInput
      label="Search Location"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      LeftIcon={Search}
      autoCapitalize="words"
      autoComplete="off"
    />
  );
}