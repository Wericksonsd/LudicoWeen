interface ModalIntroProps {
  onClose: () => void;
}

export default function ModalIntro({ onClose }: ModalIntroProps) {
  return (
    <div className="h-dvh w-dvw fixed top-0 left-0 bg-zinc-950/80 z-10 p-12" >
      <div className="h-full w-full bg-orange-300 p-6 flex flex-col items-center justify-center gap-6" >
        <h1 className="text-center text-zinc-950 text-md">
          Boas vindas a Central de Campo, seu objetivo é descobrir qual fantasma você é responsável em conter. Desbloqueie as ferramentas e as utilize para coletar dados, depois, compare esses dados com as dos documentos que lhe foi entregue, assim que tiver certeza de qual fantasma busca, o marque na caixa de seleção e finalize sua operação, mas CUIDADO! <br />
          Caso erre o fantasma terá um espaço de tempo para tentar novamente, e após outra falha, sua missão será dada como fracasso.<br /><br />
          Boa sorte, Agente.
        </h1>

        <button onClick={onClose}
        className="px-4 py-2 bg-zinc-950 text-orange-300 rounded-md">
            ENTENDIDO
        </button>
      </div>
    </div>
  );
}