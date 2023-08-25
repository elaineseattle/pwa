import { Text } from '@cigna/react-native/shared/ui/text';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { View } from 'react-native';
import { RadioButton } from '@cigna/react-native/shared/ui/radio-button';
import { useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MedicationsStackList } from '../navigation';
import { useFeatureTranslation } from '../hooks';
import { useNavigation } from '@cigna/react-native/shared/util/navigation';
import { Button } from '@cigna/react-native/ds-mobile/ui/button';
import { useShippingMethodContext } from '../providers';

export const ShippingMethod = () => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const { navigate } = useNavigation();
  const {
    params: { shippingOptions },
  } = useRoute<RouteProp<MedicationsStackList, 'shipping-method'>>();
  const [shippingMethods, setShippingMethods] = useState(shippingOptions);
  const { index: selectedShippingMethodIndex, setIndex } =
    useShippingMethodContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (deliveryType: string, index: number) => {
    setIndex(index);
    const result = shippingMethods.map((s) => ({
      ...s,
      selected: s.deliveryType === deliveryType,
    }));
    setShippingMethods(result);
  };

  return (
    <View style={tw('flex-1 p-6 pt-8')}>
      {shippingMethods.map((item, index) => {
        let label = t('checkout.shippingMethod.standard.label');
        let description = t('checkout.shippingMethod.standard.description');
        if (item?.deliveryType === 'TWO_DAY') {
          label = t('checkout.shippingMethod.twoDay.label', {
            amount: item?.cost?.amount,
          });
          description = t('checkout.shippingMethod.twoDay.description');
        } else if (item?.deliveryType === 'OVERNIGHT_PM') {
          label = t('checkout.shippingMethod.oneDay.label', {
            amount: item?.cost?.amount,
          });
          description = t('checkout.shippingMethod.oneDay.description');
        }
        return (
          <View
            key={`shiping-method-${index}`}
            testID={`shiping-method-item`}
            style={
              item.selected
                ? tw('border-2 border-primary w-full rounded-lg p-2 mt-3')
                : tw('border-2 border-neutral-04 w-full rounded-lg p-2 mt-3')
            }
          >
            <View style={tw('flex-row justify-between')}>
              <View style={tw('w-4/5 ml-3 mr-3')}>
                <Text
                  variant="heading-2"
                  style={tw('mb-1 mt-1 text-neutral-08 font-medium ml-2')}
                >
                  {label}
                </Text>
                <Text
                  variant="heading-2"
                  style={tw('mb-2 text-neutral-06 ml-2')}
                >
                  {description}
                </Text>
              </View>
              <RadioButton
                accessibilityLabel="SMS"
                onValueChange={() => {
                  handleChange(item.deliveryType, index);
                }}
                checked={item.selected || index === selectedShippingMethodIndex}
                style={tw('border-primary self-center mr-3')}
              ></RadioButton>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ShippingMethod;
