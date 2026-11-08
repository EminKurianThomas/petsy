import Svg, { Path, Circle, G } from 'react-native-svg';
import { lightColors as colors } from '../theme/theme';

/**
 * Minimalist, elegant modern pet mark combining a continuous-line
 * geometric paw print and pet silhouette.
 */
export default function MinimalLogo({ size = 44, color = colors.primary, secondaryColor = colors.accent }) {

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <G>
        {/* Outer minimalist rounded squircle container accent */}
        <Path
          d="M20 6C10 6 6 10 6 20V44C6 54 10 58 20 58H44C54 58 58 54 58 44V20C58 10 54 6 44 6H20Z"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.18"
        />

        {/* Central main pad - stylized heart/curved pad */}
        <Path
          d="M32 46C26.5 46 22 41.5 22 36C22 32.5 24.8 29.5 28.5 29C29.8 28.8 31 29.3 32 30.2C33 29.3 34.2 28.8 35.5 29C39.2 29.5 42 32.5 42 36C42 41.5 37.5 46 32 46Z"
          fill={color}
        />

        {/* Minimalist modern toe pads */}
        <Circle cx="21" cy="23" r="4.2" fill={color} />
        <Circle cx="29" cy="18" r="4.5" fill={color} />
        <Circle cx="35" cy="18" r="4.5" fill={color} />
        <Circle cx="43" cy="23" r="4.2" fill={color} />

        {/* Subtle vibrant spark / care accent */}
        <Circle cx="48" cy="14" r="2.2" fill={secondaryColor} />
      </G>
    </Svg>
  );
}
