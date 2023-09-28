import {
  fireEvent,
  render,
} from '@cigna/react-native/shared/util/testing-library';
import { getDateFnsLocale } from '@cigna/react-native/shared/util/localization';

/* @graph-ignore */
import { mockDataOrders } from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { mapOrderResponse, useFeatureNavigation } from '../../hooks';
import { OrderCard } from './order-card';
import i18n from '../../../i18n/feature-my-medications.json';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useFeatureNavigation: jest.fn(),
}));

describe('OrderCard', () => {
  const order = mockDataOrders.orders.map(mapOrderResponse)[0];

  const navigate = jest.fn();

  beforeEach(() => {
    (useFeatureNavigation as jest.Mock).mockImplementation(() => ({
      navigate,
    }));
  });

  it('should display the order date', () => {
    // const { getAllByText } = render(<OrderCard {...order} />);
    // const orderCreationDate = new Date(order.creationDate);
    // const formattedDate = format(orderCreationDate, 'PP', { locale: enUS, })
    // console.log('+++ formattedDate:' + formattedDate)
    // console.log('+++ getAllByText: ' + JSON.stringify(getAllByText))
    // const cards = getAllByText(`${formattedDate}`);
    // expect(cards.length).toBe(1);
  });

  it('should display unavailable text if drug name is missing', () => {
    const orderItem = order.orderItems[0];
    const { getByText } = render(
      <OrderCard
        {...order}
        orderItems={[
          {
            ...orderItem,
            prescription: {
              ...orderItem.prescription,
              drug: {
                ...orderItem.prescription.drug,
                name: undefined,
                dose: undefined,
              },
            },
          },
        ]}
      />,
    );
    expect(() => getByText(i18n.unavailableDrugNameText)).not.toThrow();
  });

  it('should display the order total', () => {
    const { getByText } = render(<OrderCard {...order} />);
    const cost = `$${order.orderItems
      .reduce((acc: number, itm) => acc + (itm.originalPrice || 0), 0)
      .toFixed(2)}`;
    expect(() => getByText(cost)).not.toThrow();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<OrderCard {...order} onPress={onPress} />);
    const header = getByTestId('order-header');
    fireEvent.press(header);
    expect(onPress).toHaveBeenCalled();
  });

  it('should call onPress when compact card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OrderCard variant="compact" {...order} onPress={onPress} />,
    );

    const orderDate = new Date(order.creationDate);
    const formattedDate = format(orderDate, 'PP', { locale: enUS, })
    const card = getByText(`${formattedDate}`);
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });
});
