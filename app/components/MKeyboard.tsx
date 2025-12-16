import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Text,
  View
} from "react-native";
import { COLORS } from "../style/colors";
import { globalStyle } from "../style/globalStyles.styles";
import { keepInsideScreen } from "../utils/helpers";
import MButton from "./MButton";

const { width, height } = Dimensions.get("window");

interface AnimatedButton {
  label: string;
  pos: Animated.ValueXY;
  panResponder: any;
}

export default function MKeyboard() {
  const [firstNumber, setFirstNumber] = useState("");
  const [secondNumber, setSecondNumber] = useState("");
  const [operation, setOperation] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [isChaotic, setIsChaotic] = useState(false);

  const buttons = [
    "C", "+/-", "%", "÷",
    "7","8","9","×",
    "4","5","6","-",
    "1","2","3","+",
    "0",".","⌫","="
  ];

  const getGridPosition = (index: number) => {
    const cols = 4;
    const buttonWidth = 72;
    const buttonMargin = 8;
    const totalButtonSize = buttonWidth + (buttonMargin * 2);
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const gridWidth = totalButtonSize * cols;
    const startX = (width - gridWidth) / 2;
    const startY = height * 0.38;
    
    return {
      x: startX + (col * totalButtonSize),
      y: startY + (row * totalButtonSize)
    };
  };

  const handleNumberPress = (value: string) => {
    shuffleButtons();
    
    if (result !== null) {
      setResult(null);
      setFirstNumber(value);
      return;
    }
    
    if (value === "." && firstNumber.includes(".")) return;
    
    if (firstNumber.length < 10) {
      setFirstNumber(firstNumber + value);
    }
  };

  const handleOperationPress = (value: string) => {
    shuffleButtons();
    
    if (firstNumber === "" && result === null) return;
    
    if (result !== null) {
      setSecondNumber(result.toString());
      setResult(null);
    } else if (operation && firstNumber) {
      const a = parseFloat(secondNumber);
      const b = parseFloat(firstNumber);
      let output = 0;
      
      switch (operation) {
        case "+": output = a + b; break;
        case "-": output = a - b; break;
        case "×": output = a * b; break;
        case "÷": output = b === 0 ? NaN : a / b; break;
      }
      
      setSecondNumber(output.toString());
      setFirstNumber("");
    } else {
      setSecondNumber(firstNumber);
      setFirstNumber("");
    }
    
    setOperation(value);
  };

  const toggleSign = () => {
    shuffleButtons();
    if (firstNumber) {
      setFirstNumber(firstNumber.startsWith("-") 
        ? firstNumber.slice(1) 
        : "-" + firstNumber
      );
    }
  };

  const handlePercent = () => {
    shuffleButtons();
    if (firstNumber) {
      setFirstNumber((parseFloat(firstNumber) / 100).toString());
    }
  };

  const clear = () => {
    shuffleButtons();
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
    setResult(null);
  };

  const getResult = () => {
    shuffleButtons();

    if (!operation || !secondNumber || !firstNumber) return;

    const a = parseFloat(secondNumber);
    const b = parseFloat(firstNumber);

    if (isNaN(a) || isNaN(b)) return;

    let output = 0;

    switch (operation) {
      case "+":
        output = a + b;
        break;
      case "-":
        output = a - b;
        break;
      case "×":
        output = a * b;
        break;
      case "÷":
        output = b === 0 ? NaN : a / b;
        break;
    }

    setResult(output);
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
  };

  const handlePress = (label: string) => {
    if (!isNaN(Number(label))) return handleNumberPress(label);
    if (label === "C") return clear();
    if (label === "⌫") return setFirstNumber(firstNumber.slice(0, -1));
    if (label === "=") return getResult();
    if (["+", "-", "×", "÷"].includes(label)) return handleOperationPress(label);
    if (label === ".") return handleNumberPress(".");
    if (label === "+/-") return toggleSign();
    if (label === "%") return handlePercent();
  };

  const touchState = useRef<{ [key: number]: { isDragging: boolean } }>({});

  const animatedButtons = useRef<AnimatedButton[]>(
    buttons.map((label, index) => {
      const gridPos = getGridPosition(index);
      const pos = new Animated.ValueXY({
        x: gridPos.x,
        y: gridPos.y,
      });

      const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          pos.stopAnimation();
          pos.extractOffset();
          
          touchState.current[index] = { isDragging: false };
        },

        onPanResponderMove: (_, gesture) => {
          const state = touchState.current[index];
          if (!state) return;
          
          const distance = Math.sqrt(
            Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2)
          );
          
          if (distance > 8) {
            state.isDragging = true;
            setIsChaotic(true);
            pos.setValue({ x: gesture.dx, y: gesture.dy });
          }
        },

        onPanResponderRelease: () => {
          const state = touchState.current[index];
          pos.flattenOffset();
          keepInsideScreen(pos);
          
          if (state && !state.isDragging) {
            handlePress(label);
          }
          
          delete touchState.current[index];
        },

        onPanResponderTerminate: () => {
          pos.flattenOffset();
          delete touchState.current[index];
        }
      });

      return { label, pos, panResponder };
    })
  ).current;

  const shuffleButtons = () => {
    setIsChaotic(true);
    animatedButtons.forEach((btn) => {
      Animated.timing(btn.pos, {
        toValue: {
          x: Math.random() * (width - 100),
          y: Math.random() * (height * 0.55) + height * 0.25,
        },
        duration: 250,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    });
  };

  const resetToGrid = () => {
    setIsChaotic(false);
    animatedButtons.forEach((btn, index) => {
      const gridPos = getGridPosition(index);
      Animated.timing(btn.pos, {
        toValue: {
          x: gridPos.x,
          y: gridPos.y,
        },
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  };

  const firstNumberDisplay = () => {
    if (result !== null) {
      return (
        <Text style={[globalStyle.screenFirstNumber, { color: COLORS.result }]}>
          {result}
        </Text>
      );
    }

    return (
      <Text style={globalStyle.screenFirstNumber}>
        {firstNumber || "0"}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <View style={{ 
        height: 120, 
        width: "90%", 
        // alignSelf: "center", 
        // justifyContent: "flex-end", 
        marginTop: 60 
      }}>
        <Text style={globalStyle.screenSecondNumber}>
          {secondNumber}
          <Text style={{ fontSize: 50, color: COLORS.blue }}>{operation}</Text>
        </Text>
        {firstNumberDisplay()}
      </View>

      {animatedButtons.map((btn, index) => (
        <Animated.View  
          key={index}
          style={[
            { position: "absolute", transform: btn.pos.getTranslateTransform() },
          ]}
          {...btn.panResponder.panHandlers}
        >
          <MButton title={btn.label} onPress={() => {}} />
        </Animated.View>
      ))}

      {isChaotic && (
        <View style={{ position: "absolute", bottom: 40, alignSelf: "center" }}>
          <MButton 
            title="⟲" 
            onPress={resetToGrid}
          />
        </View>
      )}

    </View>
  );
}