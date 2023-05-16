import { WidgetProps } from "@medusajs/types"
import { useNavigate } from "react-router-dom"
import useNotification from "../../../hooks/use-notification"
import { useFeatureFlag } from "../../../providers/feature-flag-provider"
import { EntityMap, PropKeyMap } from "./types"

type UseWidgetContainerProps<T extends keyof EntityMap> = {
  injectionZone: T
  entity?: EntityMap[T]
}

export const useWidgetContainerProps = <T extends keyof EntityMap>({
  injectionZone,
  entity,
}: UseWidgetContainerProps<T>) => {
  /** Feature Flags */
  const featureFlags = useFeatureFlag()

  /** Navigation */
  const navigate = useNavigate()

  /** Notifications */
  const notification = useNotification()

  const notify = {
    success: (title: string, message: string) => {
      notification(title, message, "success")
    },
    error: (title: string, message: string) => {
      notification(title, message, "error")
    },
    warning: (title: string, message: string) => {
      notification(title, message, "warning")
    },
    info: (title: string, message: string) => {
      notification(title, message, "info")
    },
  }

  /** Base props that are always passed to a widget */
  const baseProps: WidgetProps = {
    notify,
    featureFlags,
    navigate,
  }

  /**
   * Not all InjectionZones have an entity, so we need to check for it first, and then
   * add it to the props if it exists.
   */
  if (entity) {
    const propKey = injectionZone.split(".")[0] as keyof PropKeyMap

    return {
      ...baseProps,
      [propKey]: entity,
    }
  }

  return baseProps
}