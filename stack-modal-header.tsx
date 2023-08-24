import { LeafText } from '@cigna/react-native/leaf/ui/text';
import { LeafIcon } from '@cigna/react-native/leaf/ui/icon';
import { useLeaf } from '@cigna/react-native/leaf/util/leaf';
import { sizeUtil } from '@cigna/react-native/leaf/util/spacing';
import { getHeaderTitle } from '@react-navigation/elements';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { StackHeaderProps } from '@react-navigation/stack';

/**
 * `import { LeafStackModalHeader } from '@cigna/react-native/leaf/ui/navigation/stack-modal-header'`
 *
 * This header component is built to replace the StackNavigation Header and accepts the props that can be found at https://reactnavigation.org/docs/stack-navigator#header-related-options
 *
 * ```jsx
 * <StackNavigator screenOptions={{ header: LeafStackModalHeader }} />
 * ```
 *
 * You should not override the `back` property, this should be inherited from the stack that the current screen is in.
 */
const LeafStackModalHeader: React.FC<StackHeaderProps> = ({
  back,
  navigation = { goBack: () => null },
  options: allOptions = {},
  route,
}) => {
  const options = { headerStyle: { height: 100 }, ...allOptions };
  const { leaf } = useLeaf();
  const title = route.name ? getHeaderTitle(options, route.name) : '';
  const hasHeaderButtons = options.headerRight || options.headerLeft;
  const iconSize = sizeUtil(3.5);

  return (
    <View
      style={[
        { backgroundColor: leaf('leaf-color-bg-subtle'), width: '100%' },
        options.headerStyle && (options.headerStyle as ViewStyle),
      ]}
    >
      {options.headerBackground && options.headerBackground({ style: false })}
      <View
        style={{
          flex: 1,
          gap: sizeUtil(1),
          paddingTop: sizeUtil(1),
          paddingBottom: sizeUtil(3),
          paddingHorizontal: sizeUtil(3),
          justifyContent: 'flex-end',
        }}
      >
        {hasHeaderButtons && (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            testID="header-buttons"
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: sizeUtil(1.5),
              }}
            >
              <View>{options.headerLeft && options.headerLeft({})}</View>
              <View>{options.headerRight && options.headerRight({})}</View>
            </View>
          </View>
        )}
        <View
          style={[
            {
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sizeUtil(2),
            },
          ]}
          testID="header-title-container"
        >
          <View style={{ width: iconSize, height: iconSize }}>
            {back && (
              <Pressable
                onPress={navigation.goBack}
                accessibilityRole="button"
                accessibilityLabel={options.headerBackTitle || back.title}
                testID="header-back-button"
              >
                <LeafIcon variant="arrow-left" size={iconSize} />
              </Pressable>
            )}
          </View>
          <View
            style={{
              flex: 1,
              flexShrink: 1,
            }}
          >
            <LeafText
              variant="title-default"
              style={{ textAlign: 'center' }}
              numberOfLines={1}
              allowFontScaling={false}
              testID={`text-header-${title}`}
            >
              {title}
            </LeafText>
          </View>
          <View style={{ width: iconSize, height: iconSize }}>
            {back && (
              <Pressable
                onPress={navigation.goBack}
                accessibilityRole="button"
                accessibilityLabel={options.headerBackTitle || back.title}
                testID="header-back-button"
              >
                <LeafIcon variant="x" size={iconSize} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export { LeafStackModalHeader };
export default LeafStackModalHeader;
