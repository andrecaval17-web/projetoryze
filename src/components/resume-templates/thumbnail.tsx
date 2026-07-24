import type { ResumeData, ResumeTemplateSlug } from "@/lib/resume-schema";
import { RESUME_PREVIEW_COMPONENTS } from "./preview";

// Miniatura de verdade, não um placeholder: renderiza o MESMO componente de
// preview usado na tela de edição, só que encolhido via CSS transform dentro
// de uma caixa de tamanho fixo — mais barato que gerar um PDF só pra
// thumbnail de cada item do histórico.
const SOURCE_WIDTH = 720;
const SCALE = 0.22;

export function ResumeThumbnail({ data, templateSlug }: { data: ResumeData; templateSlug: ResumeTemplateSlug }) {
  const PreviewComponent = RESUME_PREVIEW_COMPONENTS[templateSlug];
  return (
    <div
      className="overflow-hidden rounded-md border border-border bg-bg-surface-2"
      style={{ width: SOURCE_WIDTH * SCALE, height: 210 }}
    >
      <div
        style={{
          width: SOURCE_WIDTH,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
        }}
      >
        <PreviewComponent data={data} />
      </div>
    </div>
  );
}
