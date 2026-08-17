export const PLANO = {
  nome: "Nina Fit IA — Mensal",
  valor: 39.9,
  valorFormatado: "R$ 39,90",
  ciclo: "por mês",
  descricao: "Acesso ilimitado à Nina: dieta, treino e ajustes na sua rotina.",
  beneficios: [
    "Plano alimentar que cabe na sua rotina",
    "Treinos para casa ou academia",
    "Ajustes sempre que precisar, sem consulta marcada",
    "Respostas na hora, direto no chat",
    "Cancele quando quiser",
  ],
} as const;

export type StatusAssinatura = "nenhuma" | "ativo" | "atrasado" | "cancelado";

export const STATUS_LABEL: Record<StatusAssinatura, string> = {
  nenhuma: "Sem assinatura",
  ativo: "Ativa",
  atrasado: "Pagamento atrasado",
  cancelado: "Cancelada",
};

export const SUPORTE_EMAIL = "suporte@ninafitia.com.br";

export function podeAcessarChat(status: string | null | undefined) {
  return status === "ativo" || status === "atrasado";
}