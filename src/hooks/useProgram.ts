import { useState, useCallback } from "react";
import { load, save } from "@/lib/storage";
import { getProgram } from "@/data/program";
import type { ProgramId } from "@/lib/types";

const KEY = "selected_program";

export function useProgram() {
  const [programId, setProgramId] = useState<ProgramId>(
    () => load<ProgramId>(KEY, "ppl"),
  );

  const program = getProgram(programId);

  const selectProgram = useCallback((id: ProgramId) => {
    setProgramId(id);
    save(KEY, id);
  }, []);

  return { programId, program, selectProgram };
}
