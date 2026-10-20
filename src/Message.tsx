
type MessageProps = {
  name: string;
  department: string;
};

function Message({ name, department }: MessageProps) {
  return (
    <div>
      <h2>Welcome, {name}!</h2>
      <p>Department: {department}</p>
    </div>
  );
}

export default Message;
