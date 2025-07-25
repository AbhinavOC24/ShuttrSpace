const ConnectWalletButton = ({
  onClick,
  connected,
  loading,
}: {
  onClick: () => void;
  connected: boolean;
  loading: boolean;
}) => {
  const getButtonText = () => {
    if (loading) return "Signing...";
    if (connected) return "Sign the message";
    return "Connect Wallet";
  };

  const isDisabled = connected && loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`h-[50px] absolute w-[208px] flex items-center justify-center bottom-0 right-0 rounded-br-[40px] rounded-tl-[10px]
          font-family-neue font-medium text-sm border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
          transition ease-in-out ${
            isDisabled
              ? "bg-gray text-gray-400 cursor-not-allowed"
              : "bg-black cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]"
          }`}
    >
      {getButtonText()}
    </button>
  );
};
export default ConnectWalletButton;
