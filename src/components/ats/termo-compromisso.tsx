const RYZE_ITEMS = [
  "Encaminhar no mínimo três candidatos por vaga, ultrapassando ou suprimindo esse número apenas em situação devidamente justificada com a contratante;",
  "Seguir a metodologia adequada à verificação do conhecimento, das habilidades e atitudes dos avaliados;",
  "Se responsabilizar pela reposição do candidato no período limite máximo de 60 (sessenta) dias corridos, caso o funcionário admitido na primeira seleção não atenda aos requisitos básicos da função. Será considerada reposição quando o candidato não atender às exigências e competências informadas pela empresa contratante no formulário de abertura de vaga;",
  "Em caso de profissionais com deficiência, a Ryze não se responsabilizará pelas informações que constem no laudo médico do candidato;",
  "Reserva-se o direito de entrevistar o candidato selecionado que venha a ser desligado no período máximo de 60 dias após a contratação, para avaliação e negociação dos requisitos do cargo;",
  "O solicitante poderá incluir candidatos no processo em andamento, sem interferir no valor previamente acordado;",
  "Caso o solicitante, após o fim do processo seletivo e no prazo de 3 meses, escolha candidatos do mesmo processo para suprir outras vagas, terá desconto de 15% sobre o valor total cobrado pela nova vaga.",
];

const CONTRATANTE_ITEMS = [
  "No período de 12 meses, a solicitante não poderá contratar candidatos apresentados pela Ryze sem que o pagamento acordado tenha sido efetuado, mesmo que reprovados em processos anteriores, sob pena de multa de três vezes o valor acordado pela vaga;",
  "O valor do serviço de Recrutamento e Seleção será referente a 100% do salário da vaga aberta, exceto vagas para pessoa com deficiência ou estágio, onde o valor corresponderá a 125% do salário (considerando salário + valor médio de comissão, se houver);",
  "Após a emissão do boleto, o pagamento deverá ser efetuado dentro do prazo estipulado. Vencido o prazo, será cobrada multa de 5% e mora de 2% ao mês sobre o valor do boleto;",
  "A contratante pagará 35% do valor da vaga à Ryze caso uma vaga já aberta seja cancelada, e também arcará com o custo dos serviços de psicólogo (empresa especializada contratada pela Ryze quando solicitado), cobrados independentemente do fechamento da vaga;",
  "Após o envio dos candidatos aptos, o solicitante deverá, em até 3 dias úteis, informar à Ryze sobre a finalização do processo;",
  "Caso o solicitante informe que os candidatos selecionados não atendem aos requisitos da vaga, será feita uma reanálise do perfil construído, mediante acordo com a contratante.",
];

export function TermoCompromisso() {
  return (
    <details className="group rounded-lg border border-border bg-bg-surface">
      <summary className="cursor-pointer list-none px-6 py-4 font-display text-body-md font-semibold text-fg marker:content-none">
        <span className="flex items-center justify-between gap-2">
          Ver Termo de Compromisso completo
          <span className="text-body-sm font-normal text-accent-600 group-open:hidden dark:text-accent-400">
            Expandir
          </span>
          <span className="hidden text-body-sm font-normal text-accent-600 group-open:inline dark:text-accent-400">
            Recolher
          </span>
        </span>
      </summary>
      <div className="max-h-96 overflow-y-auto border-t border-border px-6 py-5">
        <div className="flex flex-col gap-4 text-body-sm leading-relaxed text-fg-muted">
          <div>
            <h3 className="font-display text-body-md font-semibold text-fg">TERMO DE COMPROMISSO</h3>
            <p className="mt-1 font-medium text-fg">CONSIDERAÇÕES DO PROCESSO DE PROVISÃO DE PESSOAS</p>
          </div>

          <p>
            Fica acordado por parte da RYZE CONSULTORIA EM RECURSOS HUMANOS, CNPJ: 59.031.010/0001-37:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            {RYZE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p>Fica acordado por parte do Contratante:</p>
          <ul className="ml-5 list-disc space-y-2">
            {CONTRATANTE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p>
            Estando ciente de todas as observações contratuais e do funcionamento do processo seletivo
            contidas neste termo, firmo e atesto o compromisso com a Ryze Consultoria em Recursos Humanos.
          </p>
        </div>
      </div>
    </details>
  );
}
