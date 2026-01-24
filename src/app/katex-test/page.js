import katex from "katex";
import Link from "next/link";

const inlineSamples = [
  "\\frac{d}{dx} e^{x} = e^{x}",
  "c = \\pm\\sqrt{a^{2} + b^{2}}",
  "e^{i\\pi} + 1 = 0",
];

const blockSamples = [
  "\\int_{0}^{\\infty} x^{k-1} e^{-x} \\, dx = \\Gamma(k)",
  "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_{0}}",
];

const renderLatex = (tex, displayMode = false) =>
  katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });

export default function KatexTestPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-12 text-slate-900">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">KaTeX Preview</h1>
        <p className="text-base leading-6 text-slate-600">
          This route renders a few inline and block expressions with KaTeX so
          you can quickly verify styling and font loading before integrating it
          into the full experience.
        </p>
        <Link
          className="inline-flex w-max items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm transition-colors hover:bg-slate-100"
          href="/"
        >
          {"<- Back to home"}
        </Link>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium">Inline formulas</h2>
        <ul className="flex flex-col gap-3">
          {inlineSamples.map((tex) => (
            <li
              key={tex}
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-base shadow-sm"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: renderLatex(tex),
                }}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium">Block formulas</h2>
        <div className="flex flex-col gap-6">
          {blockSamples.map((tex) => (
            <div
              key={tex}
              className="overflow-x-auto rounded-md border border-slate-200 bg-white px-4 py-6 shadow-sm"
            >
              <div
                className="min-w-fit"
                dangerouslySetInnerHTML={{
                  __html: renderLatex(tex, true),
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
