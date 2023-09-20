import { useState, useCallback, ReactNode, useEffect } from 'react';
import {
  SectionList,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { LeafText } from '@cigna/react-native/leaf/ui/text';
import { Icon } from '@cigna/react-native/shared/ui/icon';
import {
  Loading,
  LoadingError,
} from '@cigna/react-native/evernorth-mobile/ui/loading';
import {
  useFeatureNavigation,
  useFeatureTranslation,
  usePrescriptions,
} from '../hooks';
import { LoadMore, PrescriptionCard, EmptyCard } from '../components';
import { Prescription } from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { useTrackAction } from '@cigna/shared/analytics/react-native';
import { useIsFocused } from '@react-navigation/native';

export const PrescriptionsList = () => {
  const { t } = useFeatureTranslation();
  const { navigate } = useFeatureNavigation();
  const { tw } = useTailwind();
  const [showArchived, setShowArchived] = useState(false);
  const active = usePrescriptions();
  const archived = usePrescriptions({ archived: true });
  const trackAction = useTrackAction();
  const isFocused = useIsFocused();
  const statusList = ['Created', 'Pending', 'Cancelled', 'Dispensed'];
  const sections = [
    {
      name: 'active',
      data: active.prescriptions,
      total: active.totalCount,
      isLoading: active.isLoading,
      isError: active.isError,
      reload: active.refetch,
    },
    {
      name: 'archived',
      data: archived.prescriptions,
      total: archived.totalCount,
      isLoading: archived.isLoading,
      isError: archived.isError,
      reload: archived.refetch,
    },
  ];

  const handleCartStatus = (status: string) =>
    status === 'Refill' || status === 'Renewal' || status === 'Pendable'
      ? 'Actionable'
      : 'Non Actionable';

  const handleTrackAction = () => {
    let productEvent = '';
    let totalCounter = 0;
    sections.forEach((item) => {
      totalCounter += item.total;
      item.data.forEach((ele: Prescription) => {
        const val = ele.status.length ? 'Y' : 'N';
        const refillValue = ele.autoRefillEligibleIndicator
          ? ele.autoRefillEnrollmentIndicator
            ? 'Enrolled'
            : 'Eligible'
          : 'Not Eligible';
        const retailRefillAllowanceRRAIndicator =
          ele.pharmacyCategory === 'retail' && ele.autoRefillEligibleIndicator
            ? 'Y'
            : 'N';
        const cartStatus = handleCartStatus(ele.status);
        productEvent += `productViews;${ele.drug.name};1;;event70=${0};eVar27=${
          ele.status
        }|eVar28=${val}|
          eVar34=${refillValue}|eVar38=${ele.rxArchived}|eVar39=${''}|eVar55=${
          ele.drug.ndc
        }|
          eVar62=${retailRefillAllowanceRRAIndicator}|eVar64=${''}|eVar65=${''}|
          eVar78=${ele.drug.name}|eVar114=${
          ele.pharmacyName
        }|eVar118=${''}|eVar119=${cartStatus}|eVar144=${''}${''},`;
      });
    });
    interface EventObj {
      displayedOpportunitiesCounter: number;
      '&&event': string;
      '&&product': string;
    }
    const actionObj: EventObj = {
      displayedOpportunitiesCounter: totalCounter,
      '&&event': 'prodView,event70',
      '&&product': productEvent,
    };

    trackAction(
      {
        controlName: 'prescriptionList',
        controlText: 'prescriptionList_screen',
      },
      {
        additionalInfo: {
          ...actionObj,
        },
      },
    );
  };

  useEffect(() => {
    if (isFocused) {
      handleTrackAction();
    }
  }, [isFocused, active.isLoading, archived.isLoading]);

  const renderItem = useCallback(
    ({ section, item }) => {
      if (section.name === 'archived' && !showArchived) {
        return null;
      }

      return (
        <PrescriptionCard
          {...item}
          onPress={() => {
            trackAction({
              controlName: `prescriptionDetails`,
              controlText: 'prescriptionDetails_button',
            });
            navigate('prescription-details', { prescription: item });
          }}
          testID={`prescription-${item.rxNumber}`}
          onActionPress={async () => {
            if (
              item.autoRefillEnrollmentIndicator &&
              statusList.includes(item.lastFillStatus)
            ) {
              navigate('order-history');
              return;
            }
            if (
              section.name !== 'archived' &&
              (item?.status === 'Refill' ||
                item?.status === 'Renewal' ||
                item?.status === 'Pendable')
            ) {
              navigate('refill-renew-preorder', { prescription: item });
              return;
            }
            if (item?.status === 'AutoRefill') {
              await Linking.openURL(
                'https://www.express-scripts.com/frontend/consumer/#/autorefill',
              );
            }
          }}
        />
      );
    },
    [showArchived, navigate],
  );

  const renderSectionHeader = useCallback(
    ({ section }) => {
      let loadingMessage: ReactNode = null;

      if (section.isError) {
        loadingMessage = <LoadingError onReload={section.reload} />;
      }
      if (!section.isError && section.isLoading) {
        loadingMessage = <Loading />;
      }
      if (!section.isError && !section.isLoading && section.data.length === 0) {
        loadingMessage = <EmptyCard />;
      }
      if (section.name === 'archived' && !showArchived) {
        loadingMessage = null;
      }
      return (
        <View style={tw('gap-2 bg-white')}>
          {section.name === 'archived' && (
            <Pressable
              style={tw('flex-row py-6 self-stretch justify-between')}
              onPress={() => setShowArchived(!showArchived)}
              testID="archived-toggle"
            >
              <LeafText variant="title-small">
                {t('prescriptions.archivedListTitle', { count: section.total })}
              </LeafText>
              {showArchived ? (
                <Icon
                  testID="opened-icon"
                  variant="chevron-up"
                  color="black"
                  style={tw('w-7 h-7')}
                />
              ) : (
                <Icon
                  testID="closed-icon"
                  variant="chevron-down"
                  color="black"
                  style={tw('w-7 h-7')}
                />
              )}
            </Pressable>
          )}
          {loadingMessage}
        </View>
      );
    },
    [showArchived, tw, t],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: 'height' })}
      style={tw('flex-1')}
    >
      <View style={tw('flex-1')}>
        <SectionList<Prescription>
          sections={sections}
          initialNumToRender={5}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) =>
            `${item.rxArchived ? 'archived-' : ''}prescription-${
              item.rxNumber
            }-${item.resourceId}`
          }
          contentContainerStyle={tw('px-6 gap-4 z-10')}
          renderSectionFooter={({ section }) => {
            if (section.name === 'archived' && !showArchived) {
              return null;
            }

            const list = section.name === 'archived' ? archived : active;
            return list.hasNextPage ? (
              <LoadMore
                onPress={() => {
                  trackAction({
                    controlText: 'loadMoreButton',
                    controlName: `loadMore`,
                  });

                  list.fetchNextPage();
                }}
                isFetching={list.isFetching}
              />
            ) : null;
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

PrescriptionsList.displayName = 'PrescriptionsList';

export default PrescriptionsList;
