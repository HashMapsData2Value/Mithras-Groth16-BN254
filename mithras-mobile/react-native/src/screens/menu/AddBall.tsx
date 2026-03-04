import React from 'react';
import { TouchableOpacity, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { styles } from './MenuStyles';

type Props = {
  onPress?: () => void;
  inverted?: boolean; // inverted: white background, dark plus
  style?: StyleProp<ViewStyle>;
  plusStyle?: StyleProp<TextStyle>;
};

export const AddBall: React.FC<Props> = ({ onPress, inverted = false, style, plusStyle }) => {
  const background = inverted ? '#fff' : '#000';
  const plusColor = inverted ? '#000' : '#fff';
  const ballStyle: StyleProp<ViewStyle> = [styles.ball, { backgroundColor: background }, style];
  const plusTextStyle: StyleProp<TextStyle> = [styles.plus, { color: plusColor }, plusStyle];

  return (
    <TouchableOpacity style={ballStyle} onPress={onPress} accessibilityRole="button">
      <View>
        <Text style={plusTextStyle}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddBall;
