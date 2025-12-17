import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Text,
  View
} from "react-native";
import { ToWords } from 'to-words';
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

  const toWords = new ToWords();

  // THIS IS THE KEY FIX: Store current state in a ref so PanResponder can access it
  const stateRef = useRef({
    firstNumber: "",
    secondNumber: "",
    operation: "",
    result: null as number | null
  });

  // Update the ref whenever state changes
  stateRef.current = { firstNumber, secondNumber, operation, result };

  const buttons = [
    "C", "+/-", "%", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "⌫", "="
  ];

  const getGridPosition = (index: number) => {
    const cols = 4;
    const buttonWidth = 82;
    const buttonMargin = 6;
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
    const current = stateRef.current;

    if (current.result !== null) {
      setResult(null);
      setSecondNumber("");
      setOperation("");
      setFirstNumber(value);
      shuffleButtons();
      return;
    }

    if (value === "." && current.firstNumber.includes(".")) {
      shuffleButtons();
      return;
    }

    if (current.firstNumber.length < 10) {
      setFirstNumber(prev => prev + value);
      shuffleButtons();
    }
  };

  const handleOperationPress = (value: string) => {
    const current = stateRef.current;

    if (current.firstNumber === "" && current.result === null) {
      shuffleButtons();
      return;
    }

    if (current.result !== null) {
      setSecondNumber(current.result.toString());
      setResult(null);
      setOperation(value);
    } else if (current.operation && current.firstNumber) {
      const a = parseFloat(current.secondNumber);
      const b = parseFloat(current.firstNumber);
      let output = 0;

      switch (current.operation) {
        case "+": output = a + b; break;
        case "-": output = a - b; break;
        case "×": output = a * b; break;
        case "÷": output = b === 0 ? NaN : a / b; break;
      }

      setSecondNumber(output.toString());
      setFirstNumber("");
      setOperation(value);
    } else {
      setSecondNumber(current.firstNumber);
      setFirstNumber("");
      setOperation(value);
    }

    shuffleButtons();
  };

  const toggleSign = () => {
    const current = stateRef.current;
    if (current.firstNumber) {
      setFirstNumber(prev => prev.startsWith("-") ? prev.slice(1) : "-" + prev);
    }
    shuffleButtons();
  };

  const handlePercent = () => {
    const current = stateRef.current;
    if (current.firstNumber) {
      setFirstNumber(prev => (parseFloat(prev) / 100).toString());
    }
    shuffleButtons();
  };

  const clear = () => {
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
    setResult(null);
    shuffleButtons();
  };

  const getResult = () => {
    const current = stateRef.current;

    if (!current.operation || !current.secondNumber || !current.firstNumber) {
      shuffleButtons();
      return;
    }

    const a = parseFloat(current.secondNumber);
    const b = parseFloat(current.firstNumber);

    if (isNaN(a) || isNaN(b)) {
      shuffleButtons();
      return;
    }

    let output = 0;

    switch (current.operation) {
      case "+": output = a + b; break;
      case "-": output = a - b; break;
      case "×": output = a * b; break;
      case "÷": output = b === 0 ? NaN : a / b; break;
    }

    setResult(output);
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
    shuffleButtons();
  };

  const handlePress = (label: string) => {
    if (!isNaN(Number(label))) return handleNumberPress(label);
    if (label === "C") return clear();
    if (label === "⌫") {
      setFirstNumber(prev => prev.slice(0, -1));
      shuffleButtons();
      return;
    }
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
        <Text style={[globalStyle.screenFirstNumber, { color: COLORS.result, fontSize: 42 }]}>
          {toWords.convert(result)}
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
        alignSelf: "center",
        justifyContent: "flex-end",
        marginTop: 100
      }}>
        <Text style={globalStyle.screenSecondNumber}>
          {secondNumber && operation ? `${secondNumber} ${operation}` : " "}
        </Text>
        {firstNumberDisplay()}
      </View>

      {animatedButtons.map((btn, index) => {
        const isOperation = ["+", "-", "×", "÷", "="].includes(btn.label);
        return (
          <Animated.View
            key={index}
            style={[
              { position: "absolute", transform: btn.pos.getTranslateTransform() },
            ]}
            {...btn.panResponder.panHandlers}
          >
            <MButton title={btn.label} onPress={() => { }} isBlue={isOperation && !isChaotic} />
          </Animated.View>
        )
      })}

      {/* {isChaotic && (
        <View style={{ position: "absolute", bottom: 40, alignSelf: "center" }}>
          <MButton 
            title="⟲" 
            onPress={resetToGrid}
          />
        </View>
      )} */}

    </View>
  );
}