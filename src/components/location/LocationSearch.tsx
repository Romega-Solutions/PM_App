import React from "react";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import { Search } from "lucide-react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function LocationSearch({
  value,
  onChange,
  placeholder = "Type your city name...",
}: Props) {
  return (
    <CustomTextInput
      label="Search city"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      LeftIcon={Search}
      autoCapitalize="words"
      autoComplete="off"
      returnKeyType="search"
      accessibilityLabel="Search city or province"
      accessibilityHint="Type a city or province to narrow the available launch-stage location list."
    />
  );
}
