import { KeyboardAvoidingView, Platform, View, ScrollView } from 'react-native';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { Text } from '@cigna/react-native/ds-mobile/ui/text';
import {
  useAccountTransactions,
  useFeatureTranslation,
  useFeatureNavigation,
} from '../hooks';
import { Card } from '@cigna/react-native/shared/ui/card';
import { useEffect, useState } from 'react';
import { useLeaf } from '@cigna/react-native/ds-mobile/util/leaf';
import { Button } from '@cigna/react-native/shared/ui/button';
import { TextInput } from '@cigna/react-native/shared/ui/text-input';
import { usePaymentMethodQuery } from '@cigna/react-native/shared/feature/universal-payment-methods';
import { useRoute } from '@react-navigation/native';
import { PaymentMethod } from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { formatCurrencyUSD } from '@cigna/react-native/shared/util/format';
import { useAnalytics } from '@cigna/shared/analytics/react-native';

type Cards = 'due' | 'total' | 'other';

export const MakePayment = () => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const { navigate } = useFeatureNavigation();
  const route = useRoute();
  const { params } = route;
  const { colors } = useLeaf();
  const { defaultPaymentMethod, selectedPaymentMethod } =
    usePaymentMethodQuery();
  const { mutate, isLoading } = useAccountTransactions();
  const previousScreen = 'myMedications';
  const { trackAction } = useAnalytics();

  useEffect(() => {
    if (selectedPaymentMethod) {
      setPaymentMethod(selectedPaymentMethod);
    } else if (defaultPaymentMethod) {
      setPaymentMethod(defaultPaymentMethod);
    }
  }, [defaultPaymentMethod, selectedPaymentMethod]);

  const [selectedCard, setSelectedCard] = useState<Cards>('total');
  const [otherAmount, setOtherAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const balancePastDue =
    params?.balances?.financialAccount?.accountBalances?.agingBalances[0]
      ?.amount || 0;
  const balanceDue =
    params?.balances?.financialAccount?.accountBalances?.currentBalanceAmount ||
    0;

  const formatOtherAmount = () => {
    let tempAmount = otherAmount;

    if (tempAmount.includes('$')) {
      tempAmount = tempAmount.slice(1);
    }
    if (tempAmount === '') {
      return;
    }

    const amountNum = Number(tempAmount);
    const formattedAmount = formatCurrencyUSD(amountNum);

    setOtherAmount(formattedAmount);
  };

  const submitPayment = () => {
    trackAction(route.name, previousScreen, {
      controlName: 'payNowSubmit',
      previousScreenName: previousScreen,
    });
    if (paymentMethod) {
      const numAmount = Number(paymentAmount.replace('$', '').replace(',', ''));
      mutate(
        {
          financialAccountResourceId:
            params?.balances?.financialAccount?.resourceId,
          paymentMethodResourceId: paymentMethod.resourceId,
          transactionAmount: numAmount,
        },
        {
          onSuccess: (data) => {
            trackAction(route.name, previousScreen, {
              previousScreenName: previousScreen,
              controlName: 'payNowSuccess',
              paymentTotal: Number(numAmount),
            });
            navigate('payment-success', { data });
          },
          onError: (error) => {
            // Placeholder For Error Handling
            trackAction(route.name, previousScreen, {
              previousScreenName: previousScreen,
              controlName: 'payNowFailure',
              errorMessage: error.metadata.outcome.message,
            });
          },
        },
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: 'height' })}
      style={[tw('flex-1 p-6 gap-8'), { backgroundColor: colors.bg.default }]}
      testID="make-payment-container"
    >
      <ScrollView>
        <View style={tw('my-4 gap-6')}>
          <Text variant="heading-2">{t('makePayment.amountLabel')}</Text>
          <Card
            variant="cta"
            ctaVariant="radio"
            text={formatCurrencyUSD(balancePastDue)}
            subtext={t('makePayment.amountDueText')}
            selected={selectedCard === 'due'}
            onPress={() => {
              setSelectedCard('due');
              setPaymentAmount(formatCurrencyUSD(balancePastDue));
            }}
          />
          <Card
            variant="cta"
            ctaVariant="radio"
            text={formatCurrencyUSD(balanceDue)}
            subtext={t('makePayment.totalBalanceText')}
            selected={selectedCard === 'total'}
            onPress={() => {
              setSelectedCard('total');
              setPaymentAmount(formatCurrencyUSD(balanceDue));
            }}
          />
          <Card
            variant="cta"
            ctaVariant="radio"
            text={t('makePayment.otherAmountText')}
            selected={selectedCard === 'other'}
            onPress={() => setSelectedCard('other')}
          >
            {selectedCard === 'other' && (
              <TextInput
                placeholder={t('makePayment.otherAmountInputPlaceholderText')}
                onChangeText={(val) => {
                  setOtherAmount(val);
                  setPaymentAmount(val);
                }}
                value={otherAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onBlur={formatOtherAmount}
              />
            )}
          </Card>
        </View>
        <View style={tw('gap-6')}>
          <Text variant="heading-2">{t('makePayment.methodLabel')}</Text>
          <Card
            variant="cta"
            onPress={() => navigate('universal-payment')}
            text={
              paymentMethod
                ? // TODO: waiting for types to be setup on hook
                  // @ts-ignore
                  `${paymentMethod?.creditCardType} ****${paymentMethod?.lastFourDigits}`
                : t('makePayment.noPaymentMethodText')
            }
          />
          <Button
            disabled={
              !selectedCard ||
              !paymentMethod ||
              (selectedCard === 'due' && !Number(balancePastDue)) ||
              (selectedCard === 'total' && !Number(balanceDue)) ||
              (selectedCard === 'other' &&
                !Number(otherAmount?.replace(/\$/, '')))
            }
            size="2xl"
            style={tw('mb-4 rounded-lg')}
            textStyle={tw('normal-case')}
            testID="cart-checkout-button"
            onPress={submitPayment}
            loading={isLoading}
          >
            {t('makePayment.payNowButtonLabel')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

MakePayment.displayName = 'MakePayment';
