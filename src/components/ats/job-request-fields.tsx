"use client";

import { useState } from "react";
import {
  JOB_STATUS_OPTIONS,
  EXPERIENCE_TIME_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  BEHAVIORAL_TRAITS,
  type JobRequestRow,
} from "@/lib/job-request-options";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-6">
      <h2 className="font-display text-heading-sm font-semibold text-fg">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

type PartialRequest = Partial<
  Pick<
    JobRequestRow,
    | "company_name"
    | "requester_name"
    | "requester_role"
    | "requester_department"
    | "requester_manager"
    | "job_title"
    | "job_status"
    | "salary_composition"
    | "benefits"
    | "bonus"
    | "work_schedule"
    | "requires_experience"
    | "requires_pcd"
    | "experience_time"
    | "education_level"
    | "education_notes"
    | "technical_knowledge"
    | "computer_skills"
    | "behavioral_traits"
    | "particularities"
    | "candidate_differential"
  >
>;

interface JobRequestFieldsProps {
  initial: PartialRequest;
  /**
   * Público (obrigatório=true): a empresa precisa preencher tudo antes de
   * enviar. Painel interno (obrigatório=false): a equipe pode gerar o link
   * deixando qualquer campo em branco pra empresa completar depois.
   */
  required: boolean;
  /** Só o formulário público mostra "Empresa" travado num contexto de link já vinculado a ela — o painel interno cadastra o nome ao gerar o link. */
  showCompanyName?: boolean;
}

export function JobRequestFields({ initial, required, showCompanyName = true }: JobRequestFieldsProps) {
  const [requiresExperience, setRequiresExperience] = useState(initial.requires_experience ?? true);
  const [traits, setTraits] = useState<string[]>(initial.behavioral_traits ?? []);

  function toggleTrait(trait: string) {
    setTraits((prev) => (prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]));
  }

  return (
    <>
      <Section title="Dados do solicitante">
        {showCompanyName && (
          <FormField label="Empresa" htmlFor="company_name" required={required}>
            <Input id="company_name" name="company_name" defaultValue={initial.company_name ?? ""} required={required} />
          </FormField>
        )}
        <FormField label="Nome de quem preenche" htmlFor="requester_name" required={required}>
          <Input id="requester_name" name="requester_name" defaultValue={initial.requester_name ?? ""} required={required} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Cargo do solicitante" htmlFor="requester_role" required={required}>
            <Input id="requester_role" name="requester_role" defaultValue={initial.requester_role ?? ""} required={required} />
          </FormField>
          <FormField label="Setor" htmlFor="requester_department" required={required}>
            <Input
              id="requester_department"
              name="requester_department"
              defaultValue={initial.requester_department ?? ""}
              required={required}
            />
          </FormField>
        </div>
        <FormField label="Superior imediato" htmlFor="requester_manager" required={required}>
          <Input
            id="requester_manager"
            name="requester_manager"
            defaultValue={initial.requester_manager ?? ""}
            required={required}
          />
        </FormField>
      </Section>

      <Section title="Dados da vaga">
        <FormField label="Cargo buscado" htmlFor="job_title" required={required}>
          <Input id="job_title" name="job_title" defaultValue={initial.job_title ?? ""} required={required} />
        </FormField>
        <FormField label="Situação da vaga" htmlFor="job_status" required={required}>
          <Select id="job_status" name="job_status" defaultValue={initial.job_status ?? ""} required={required}>
            <option value="" disabled>
              Selecione
            </option>
            {JOB_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Composição salarial (R$)" htmlFor="salary_composition" required={required}>
          <Input
            id="salary_composition"
            name="salary_composition"
            defaultValue={initial.salary_composition ?? ""}
            required={required}
          />
        </FormField>
        <FormField label="Benefícios" htmlFor="benefits" required={required}>
          <Textarea id="benefits" name="benefits" rows={2} defaultValue={initial.benefits ?? ""} required={required} />
        </FormField>
        <FormField label="Premiação (caso exista)" htmlFor="bonus">
          <Input id="bonus" name="bonus" defaultValue={initial.bonus ?? ""} />
        </FormField>
        <FormField label="Horário de trabalho" htmlFor="work_schedule" required={required}>
          <Input id="work_schedule" name="work_schedule" defaultValue={initial.work_schedule ?? ""} required={required} />
        </FormField>
      </Section>

      <Section title="Avaliação do candidato buscado">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Exige experiência?" htmlFor="requires_experience" required={required}>
            <Select
              id="requires_experience"
              name="requires_experience"
              defaultValue={initial.requires_experience === false ? "nao" : initial.requires_experience === true ? "sim" : ""}
              onChange={(e) => setRequiresExperience(e.target.value === "sim")}
              required={required}
            >
              {!required && (
                <option value="" disabled>
                  Não informado
                </option>
              )}
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </FormField>
          <FormField label="Vaga para PCD?" htmlFor="requires_pcd">
            <Select id="requires_pcd" name="requires_pcd" defaultValue={initial.requires_pcd ? "sim" : "nao"}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </Select>
          </FormField>
        </div>

        {requiresExperience && (
          <FormField label="Tempo de experiência exigida" htmlFor="experience_time" required={required}>
            <Select id="experience_time" name="experience_time" defaultValue={initial.experience_time ?? ""} required={required}>
              <option value="" disabled>
                Selecione
              </option>
              {EXPERIENCE_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Formação acadêmica" htmlFor="education_level" required={required}>
          <Select id="education_level" name="education_level" defaultValue={initial.education_level ?? ""} required={required}>
            <option value="" disabled>
              Selecione
            </option>
            {EDUCATION_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Observações sobre a formação" htmlFor="education_notes">
          <Input id="education_notes" name="education_notes" defaultValue={initial.education_notes ?? ""} />
        </FormField>
        <FormField label="Conhecimento técnico / sistema específico da área" htmlFor="technical_knowledge" required={required}>
          <Textarea
            id="technical_knowledge"
            name="technical_knowledge"
            rows={2}
            defaultValue={initial.technical_knowledge ?? ""}
            required={required}
          />
        </FormField>
        <FormField label="Conhecimento em informática" htmlFor="computer_skills" required={required}>
          <Input id="computer_skills" name="computer_skills" defaultValue={initial.computer_skills ?? ""} required={required} />
        </FormField>

        <FormField
          label="Perfil comportamental"
          htmlFor="behavioral_traits"
          required={required}
          helperText="Selecione todas as características que se aplicam."
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-md border border-border bg-bg p-4 sm:grid-cols-3">
            {BEHAVIORAL_TRAITS.map((trait) => (
              <Checkbox
                key={trait}
                id={`trait-${trait}`}
                name="behavioral_traits"
                value={trait}
                checked={traits.includes(trait)}
                onChange={() => toggleTrait(trait)}
                label={trait}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Particularidade da vaga" htmlFor="particularities" required={required}>
          <Textarea
            id="particularities"
            name="particularities"
            rows={2}
            defaultValue={initial.particularities ?? ""}
            required={required}
          />
        </FormField>
        <FormField label="Diferencial desejado no candidato" htmlFor="candidate_differential" required={required}>
          <Textarea
            id="candidate_differential"
            name="candidate_differential"
            rows={2}
            defaultValue={initial.candidate_differential ?? ""}
            required={required}
          />
        </FormField>
      </Section>
    </>
  );
}
