export const Button = (props) => {
  const variantCss = "from-violet-600 to-indigo-600";
  if (props.variant === "info") {
    variantCss = "from-violet-600 to-indigo-600";
  }
  if (props.variant === "success") {
    variantCss = "from-green-600 to-teal-600";
  }
  if (props.variant === "warning") {
    variantCss = "from-orange-600 to-amber-600";
  }
  if (props.variant === "danger") {
    variantCss = "from-red-600 to-rose-600";
  }

  return (
    <button
      {...props}
      className={`px-6 p-2  rounded hover:opacity-90 text-white font-semibold  shadow-sm bg-gradient-to-tr ${variantCss}  ${props.css}`}
    >
      {props.children}
    </button>
  );
};

export const Input = (props) => {
  const { register, ...other } = props;
  if (register) {
    return (
      <input
        {...register(props.name)}
        {...other}
        className={`px-2 p-2 rounded  outline-none  border border-slate-200 font-semibold focus:ring hover:ring  ring-indigo-200 ${props.css}`}
      ></input>
    );
  } else {
    return (
      <input
        {...other}
        className={`px-2 p-2 rounded  outline-none  border border-slate-200 font-semibold focus:ring hover:ring  ring-indigo-200 ${props.css}`}
      ></input>
    );
  }
};

export const Select = (props) => {
  return (
    <select
      {...props}
      className={`px-2 p-2 rounded  outline-none  border border-slate-200 font-semibold focus:ring hover:ring  ring-indigo-200 ${props.css}`}
    >
      {props.children}
    </select>
  );
};
