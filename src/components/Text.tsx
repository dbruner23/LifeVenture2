import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography, type TypographyVariant, type ColorToken } from '../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken | string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
}

export function Text({
  variant = 'bodyMd',
  color = 'onSurface',
  align,
  weight,
  style,
  children,
  ...rest
}: TextProps) {
  const resolvedColor = (colors as Record<string, string>)[color] ?? color;

  return (
    <RNText
      {...rest}
      style={[
        typography[variant],
        { color: resolvedColor },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
