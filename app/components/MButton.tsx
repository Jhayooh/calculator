import { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { globalStyle } from "../style/globalStyles.styles";

interface MButtonProps {
    onPress: () => void;
    title: string;
    isBlue?: boolean;
    isGray?: boolean;
    isOrange?: boolean;
}

export default function MButton({title, onPress, isBlue, isGray, isOrange}:MButtonProps){
    const theme = useContext(ThemeContext);
    return (
       <TouchableOpacity 
            style={
                isBlue
                ? globalStyle.btnBlue
                : isGray
                ? globalStyle.btnGray
                : isOrange
                ? globalStyle.btnOrange
                : theme === "light"
                ? globalStyle.btnLight
                : globalStyle.btnDark
            }
            onPress={onPress}>
            <Text 
               style={
                   isBlue || isGray 
                   ? globalStyle.smallTextLight
                   : theme === "dark" 
                   ? globalStyle.smallTextLight 
                   : globalStyle.smallTextDark 
                }
            >
                {title}
            </Text>
        </TouchableOpacity>
    )
}