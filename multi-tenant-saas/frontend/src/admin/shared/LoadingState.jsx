export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="sa-loading">
      <div className="sa-spinner" />
      <p>{message}</p>
    </div>
  );
}
