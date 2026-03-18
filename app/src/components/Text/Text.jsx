import { PortableText } from "@portabletext/react";

const Text = ({ text, typo, className }) => {
  return (
    <div className={`${className}`} typo={typo}>
      <PortableText
        value={text}
        components={{
          marks: {
            strong: ({ children }) => {
              return <strong typo="bold">{children}</strong>;
            },
            link: ({ value, children }) => {
              const href = value?.href || value?.link;
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default Text;
