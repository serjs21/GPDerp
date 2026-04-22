export const shouldApplyServerPreference = (params: {
  hasClientPreference: boolean;
  isValidServerValue: boolean;
}): boolean => !params.hasClientPreference && params.isValidServerValue;
