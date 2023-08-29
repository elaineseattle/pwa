import { createStackNavigator } from '@react-navigation/stack';
import {
  Order,
  Prescription,
  Prescriber,
  OrderItem,
  ShippingOptions,
  Balances,
} from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { PlaceOrderResponse } from '../hooks/use-place-order';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MedicationsStackList = {
  'my-medications': undefined;
  'prescriptions-list': undefined;
  'prescription-details': { prescription: Prescription };
  'order-history': undefined;
  'order-details': { order: Order };
  'order-item-details': { orderItem: OrderItem; order: Order };
  'order-confirmation': { placeOrderData: PlaceOrderResponse };
  cart: undefined;
  checkout: { selectedShippingMethodIndex: number };
  'payment-success': undefined;
  placeholder: { title: string };
  'shipping-method': { shippingOptions: ShippingOptions };
  'make-payment': { balances: Balances };
  'refill-renew-preorder': { prescription: Prescription };
  'add-to-cart-success': { prescription: Prescription };
  'confirm-prescriber': {
    prescription: Prescription;
    prescribers: Prescriber[];
    originalSearch?: {
      prescriberLastName: string;
      prescriberPhoneNumber: string;
    };
  };
  'search-prescriber': {
    prescription: Prescription;
    originalSearch?: {
      prescriberLastName: string;
      prescriberPhoneNumber: string;
    };
  };
  'no-results-found': {
    prescription: Prescription;
    originalSearch?: {
      prescriberLastName: string;
      prescriberPhoneNumber: string;
    };
  };
};

export const MedicationsStack = createStackNavigator<MedicationsStackList>();
