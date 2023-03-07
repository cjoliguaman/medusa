import React, { useEffect, useMemo, useState } from "react"
import clsx from "clsx"

import useToggleState from "../../../../hooks/use-toggle-state"
import useOutsideClick from "../../../../hooks/use-outside-click"
import CheckIcon from "../../../../components/fundamentals/icons/check-icon"
import ChevronDownIcon from "../../../../components/fundamentals/icons/chevron-down"
import ChevronRightIcon from "../../../../components/fundamentals/icons/chevron-right-icon"
import UTurnIcon from "../../../../components/fundamentals/icons/u-turn-icon"
import CrossIcon from "../../../../components/fundamentals/icons/cross-icon"
import Tooltip from "../../../../components/atoms/tooltip"
import { sum } from "lodash"

export type NestedMultiselectOption = {
  value: string
  label: string
  children?: NestedMultiselectOption[]
}

type InputProps = {
  isOpen: boolean
  selected: Record<string, true>
  options: NestedMultiselectOption[]
  openPopup: () => void
  resetSelected: () => void
}

const ToolTipContent = (props: { list: string[] }) => {
  return (
    <div className="flex flex-col">
      {props.list.map((listItem) => (
        <span key={listItem}>{listItem}</span>
      ))}
    </div>
  )
}

function Input(props: InputProps) {
  const { isOpen, selected, openPopup, resetSelected, options } = props
  const selectedCount = Object.keys(selected).length

  const selectedOption = useMemo(() => {
    const ret: string[] = []

    const visit = (option: NestedMultiselectOption) => {
      if (selected[option.value]) {
        ret.push(option.label)
      }
      option.children?.forEach(visit)
    }

    options.forEach(visit)
    return ret
  }, [selected, options])

  return (
    <div
      onClick={openPopup}
      className="flex h-10 items-center justify-between rounded-rounded border border-grey-20 bg-grey-5 px-small focus-within:border-violet-60 focus-within:shadow-cta"
    >
      <div className="flex items-center gap-1">
        {!!selectedCount && (
          <Tooltip
            side="top"
            delayDuration={1500}
            content={<ToolTipContent list={selectedOption} />}
          >
            <span className="flex h-[28px] items-center gap-2 rounded-rounded border bg-grey-10 px-2 text-small font-medium text-gray-500">
              {selectedCount}
              <CrossIcon
                className="cursor-pointer"
                onClick={resetSelected}
                size={16}
              />
            </span>
          </Tooltip>
        )}
        <span>Categories</span>
      </div>
      <ChevronDownIcon
        size={16}
        style={{
          transition: ".2s transform",
          transform: `rotate(${isOpen ? 180 : 0}deg)`,
        }}
      />
    </div>
  )
}

type CheckboxProps = { isSelected: boolean }

const Checkbox = ({ isSelected }: CheckboxProps) => {
  return (
    <div
      className={clsx(
        `flex h-5 w-5 justify-center rounded-base border border-grey-30 text-grey-0`,
        {
          "bg-violet-60": isSelected,
        }
      )}
    >
      <span className="self-center">
        {isSelected && <CheckIcon size={12} />}
      </span>
    </div>
  )
}

type PopupItemProps = {
  isSelected: boolean
  option: NestedMultiselectOption
  selectedSubcategoriesCount: number
  onOptionClick: (option: NestedMultiselectOption) => void
  onOptionCheckboxClick: (option: NestedMultiselectOption) => void
}

function PopupItem(props: PopupItemProps) {
  const {
    option,
    isSelected,
    onOptionClick,
    onOptionCheckboxClick,
    selectedSubcategoriesCount,
  } = props

  const hasChildren = !!option.children?.length

  const onClick = (e) => {
    e.stopPropagation()
    if (hasChildren) {
      onOptionClick(option)
    }
  }

  return (
    <div
      onClick={onClick}
      className={clsx("flex h-[40px] items-center justify-between gap-2 px-3", {
        "cursor-pointer hover:bg-grey-10": hasChildren,
      })}
    >
      <div className="flex items-center gap-2">
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onOptionCheckboxClick(option)
          }}
        >
          <Checkbox isSelected={isSelected} />
        </div>
        {option.label}
      </div>

      {hasChildren && (
        <div className="flex items-center gap-2">
          {!!selectedSubcategoriesCount && (
            <span className="text-small text-gray-400">
              {selectedSubcategoriesCount} selected
            </span>
          )}
          <ChevronRightIcon size={16} />
        </div>
      )}
    </div>
  )
}

type PopupProps = {
  pop: () => void
  selected: Record<string, true>
  activeOption: NestedMultiselectOption
  selectedSubcategoriesCount: Record<string, number>
  onOptionClick: (option: NestedMultiselectOption) => void
  onOptionCheckboxClick: (option: NestedMultiselectOption) => void
}

function Popup(props: PopupProps) {
  const {
    activeOption,
    onOptionClick,
    onOptionCheckboxClick,
    pop,
    selected,
    selectedSubcategoriesCount,
  } = props

  const showBack = !!activeOption.value

  return (
    <div
      style={{ top: 8, boxShadow: "0px 2px 16px rgba(0, 0, 0, 0.08)" }}
      className="relative z-50 w-[100%] rounded-rounded border bg-white"
    >
      {showBack && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            pop()
          }}
          className="mb-1 flex h-[50px] cursor-pointer items-center gap-2 border-b border-grey-20 px-3 hover:bg-grey-10"
        >
          <UTurnIcon size={16} />
          <span className="font-medium">{activeOption.label}</span>
        </div>
      )}
      {activeOption.children!.map((o) => (
        <PopupItem
          option={o}
          isSelected={selected[o.value]}
          onOptionClick={onOptionClick}
          onOptionCheckboxClick={onOptionCheckboxClick}
          selectedSubcategoriesCount={selectedSubcategoriesCount[o.value]}
          key={o.value}
        />
      ))}
    </div>
  )
}

type NestedMultiselectProps = {
  options: NestedMultiselectOption[]
  onSelect: (values: string[]) => void
  initiallySelected?: Record<string, true>
}

function NestedMultiselect(props: NestedMultiselectProps) {
  const { options, initiallySelected, onSelect } = props
  const [isOpen, openPopup, closePopup] = useToggleState(false)

  const rootRef = React.useRef<HTMLDivElement>(null)
  useOutsideClick(closePopup, rootRef, true)

  const [activeOption, setActiveOption] = useState<NestedMultiselectOption>({
    value: null,
    label: null,
    children: options,
  })

  const [selected, setSelected] = useState<Record<string, true>>(
    initiallySelected || {}
  )

  const select = (option: NestedMultiselectOption) => {
    const nextState = { ...selected }
    nextState[option.value] = true
    setSelected(nextState)
  }

  const deselect = (option: NestedMultiselectOption) => {
    const nextState = { ...selected }
    delete nextState[option.value]
    setSelected(nextState)
  }

  const onOptionCheckboxClick = (option: NestedMultiselectOption) => {
    if (selected[option.value]) {
      deselect(option)
    } else {
      select(option)
    }
  }

  const onOptionClick = (option: NestedMultiselectOption) => {
    setActiveOption(option)
  }

  const pop = () => {
    let parent

    const find = (o: NestedMultiselectOption) => {
      if (o.children?.some((c) => c.value === activeOption.value)) {
        parent = o
      }
      o.children?.forEach(find)
    }

    find({ value: null, label: null, children: options })

    if (parent) {
      setActiveOption(parent)
    }
  }

  const resetSelected = () => {
    setSelected({})
    closePopup()
  }

  useEffect(() => {
    if (!isOpen) {
      setActiveOption({
        value: null,
        label: null,
        children: options,
      })
    }
  }, [isOpen])

  useEffect(() => {
    onSelect(Object.keys(selected))
  }, [selected])

  const selectedSubcategoriesCount = useMemo(() => {
    const counts = {}

    const visit = (option: NestedMultiselectOption) => {
      const numOfSelectedDescendants = sum(option.children?.map(visit))

      counts[option.value] = numOfSelectedDescendants
      return selected[option.value]
        ? numOfSelectedDescendants + 1
        : numOfSelectedDescendants
    }

    options.forEach(visit)

    return counts
  }, [selected, options])

  return (
    <div ref={rootRef} className=" h-[40px]">
      <Input
        isOpen={isOpen}
        openPopup={openPopup}
        resetSelected={resetSelected}
        selected={selected}
        options={options}
      />
      {isOpen && (
        <Popup
          pop={pop}
          selected={selected}
          activeOption={activeOption}
          onOptionClick={onOptionClick}
          onOptionCheckboxClick={onOptionCheckboxClick}
          selectedSubcategoriesCount={selectedSubcategoriesCount}
        />
      )}
    </div>
  )
}

export default NestedMultiselect