export const createConfirmMessage = async (
  message: string
): Promise<boolean> => {
  return window.confirm(message);
};
