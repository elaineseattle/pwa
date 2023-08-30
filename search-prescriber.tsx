import React, { useState } from 'react';
import { BottomSheet } from '@cigna/react-native/shared/ui/bottom-sheet';
import { View } from 'react-native';
import { Button } from '@cigna/react-native/shared/ui/button';
import { TextInput } from '@cigna/react-native/shared/ui/text-input';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { Text } from '@cigna/react-native/ds-mobile/ui/text';
import {
  useSearchPrescriber,
  useFeatureTranslation,
  useFeatureNavigation,
} from '../hooks';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MedicationsStackList } from '../navigation';

export const SearchPrescriber: React.FC = () => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const { pop, navigate, getState } = useFeatureNavigation();
  const {
    params: { prescription, originalSearch },
  } = useRoute<RouteProp<MedicationsStackList, 'search-prescriber'>>();
  const [isFocused, setIsFocused] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(
    !!prescription?.drug?.name,
  );
  console.log('showBottomSheet: ' + showBottomSheet)
  const [prescriberLastName, setPrescriberLastName] = useState<string>(
    originalSearch?.prescriberLastName ?? '',
  );
  const [prescriberPhoneNumber, setPrescriberPhoneNumber] = useState<string>(
    originalSearch?.prescriberPhoneNumber ?? '',
  );

  const onSuccess = () => {
    setShowBottomSheet(false);
  };

  const { data, refetch, isSuccess } = useSearchPrescriber({
    prescriberLastName,
    prescriberPhoneNumber,
    onSuccess,
  });

  const headerLabel = t('searchPrescriber.headerText');
  const lastNameLabel = t('searchPrescriber.lastNameText');
  const phoneNumberLabel = t('searchPrescriber.phoneNumberText');
  const searchBtnlabel = t('searchPrescriber.btnText');

  const onSearchPress = () => refetch();

  let phoneNumber = prescriberPhoneNumber;
  if (!isFocused) {
    const match = phoneNumber.replace(/[^\d]/g, '');
    const part1 = match.length > 2 ? `(${match.substring(0, 3)})` : match;
    const part2 = match.length > 3 ? ` ${match.substring(3, 6)}` : '';
    const part3 = match.length > 6 ? `-${match.substring(6, 10)}` : '';
    phoneNumber = `${part1}${part2}${part3}`;
  }

  return (
    <BottomSheet
      onDismiss={() => {
        setShowBottomSheet(false);
        pop(getState().index - 1);
      }}
      onClose={() => {
        pop(getState().index - 1);
        if (isSuccess) {
          if (data?.prescribers.length >= 1) {
            navigate('confirm-prescriber', {
              prescription,
              prescribers: data?.prescribers,
              originalSearch: { prescriberLastName, prescriberPhoneNumber },
            });
          } else {
            navigate('no-results-found', {
              prescription,
              originalSearch: { prescriberLastName, prescriberPhoneNumber },
            });
          }
        }
      }}
      initialSnapPoint={50}
      visible={showBottomSheet}
      repositionForKeyboard={true}
    >
      <View style={tw('px-6 gap-8')} testID="view-bottom-sheet">
        <Text
          style={tw('mt-10')}
          variant="heading-1"
          testID="header-text-label"
        >
          {headerLabel}
        </Text>
        <TextInput
          label={lastNameLabel}
          value={prescriberLastName}
          onChangeText={(value) => setPrescriberLastName(value)}
          testID="last-name-input"
        />
        <TextInput
          label={phoneNumberLabel}
          value={phoneNumber}
          onChangeText={(value) => setPrescriberPhoneNumber(value)}
          testID="phone-number-input"
          inputMode="tel"
          onFocus={() => setIsFocused(true)}
          onEndEditing={() => setIsFocused(false)}
        />
        <Button
          size="2xl"
          style={tw('mb-4 rounded-lg')}
          textStyle={tw('normal-case')}
          onPress={onSearchPress}
          testID="search-button"
        >
          {searchBtnlabel}
        </Button>
      </View>
    </BottomSheet>
  );
};
export default SearchPrescriber;
