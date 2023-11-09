export function createStep(
  name: string,
  invokeFn: Function,
  compensateFn?: Function
) {
  return function (...otherStepInput) {
    // @ts-ignore
    if (!this.workflowId) {
      throw new Error(
        "createStep must be used inside a createWorkflow definition"
      )
    }

    const stepName = name ?? invokeFn.name
    const handler = {
      invoke: async (transactionContext) => {
        const { invoke, payload, container } = transactionContext
        const output = await invokeFn.apply(
          // @ts-ignore
          this,
          // @ts-ignore
          otherStepInput.map((st) =>
            st?.__step__ ? invoke[st.__step__]?.output : st
          )
        )
        return {
          output,
        }
      },
      compensate: compensateFn
        ? async ({ invoke }) => {
            const output = await compensateFn.apply(
              // @ts-ignore
              this,
              invoke[stepName].output
            )
            return {
              output,
            }
          }
        : undefined,
    }

    // @ts-ignore
    this.flow.addAction(stepName, {
      noCompensation: !compensateFn,
    })
    // @ts-ignore
    this.handlers.set(stepName, handler)

    return {
      __step__: stepName,
    }
  }
}