import React, { ReactElement, useCallback, useEffect, useState } from "react"
import { importLegacyKeyring } from "@tallyho/tally-background/redux-slices/keyrings"
import { useHistory } from "react-router-dom"
import { isValidMnemonic } from "@ethersproject/hdnode"
import classNames from "classnames"
import { HIDE_IMPORT_DERIVATION_PATH } from "@tallyho/tally-background/features/features"
import SharedButton from "../../components/Shared/SharedButton"
import SharedBackButton from "../../components/Shared/SharedBackButton"
import SharedCheckbox from "../../components/Shared/SharedCheckbox"
import SharedSelect from "../../components/Shared/SharedSelect"
import {
  useBackgroundDispatch,
  useBackgroundSelector,
  useAreKeyringsUnlocked,
} from "../../hooks"

// TODO make this network specific
const derivationPaths: { value: string; label: string }[] = [
  {
    value: "m/44'/60'/0'/0",
    label: "ETH (m/44'/60'/0'/0)",
  },
  {
    value: "m/44'/1'/0'/0",
    label: "ETH Testnet (m/44'/1'/0'/0)",
  },
  {
    value: "m/44'/61'/0'/0",
    label: "Trezor (m/44'/61'/0'/0)",
  },
  {
    value: "m/44'/137'/0'/0",
    label: "RSK (m/44'/137'/0'/0)",
  },
  {
    value: "m/44'/37310'/0'/1",
    label: "RSK Testnet (m/44'/37310'/0'/0)",
  },
]

function TextArea({
  value,
  onChange,
  errorMessage,
}: {
  value: string
  onChange: (value: string) => void
  errorMessage: string
}) {
  return (
    <>
      <textarea
        className={classNames("wrap center_horizontal", {
          error: errorMessage,
        })}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      {errorMessage && <div className="error_message">{errorMessage}</div>}
      <style jsx>{`
        textarea {
          width: 332px;
          height: 97px;
          border-radius: 4px;
          border: 2px solid var(--green-60);
          padding: 12px 16px;
          box-sizing: border-box;
        }
        .error,
        .error:focus {
          border-color: var(--error);
        }
        .error_message {
          color: var(--error);
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          align-self: flex-start;
          height: 20px;
          margin-top: 3px;
          margin-bottom: -23px;
        }
      `}</style>
    </>
  )
}

type Props = {
  nextPage: string
}

export default function OnboardingImportMetamask(props: Props): ReactElement {
  const { nextPage } = props

  const areKeyringsUnlocked = useAreKeyringsUnlocked(true)

  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isChecked, setIsChecked] = useState(false)
  const [path, setPath] = useState<string>()
  const [isImporting, setIsImporting] = useState(false)

  const dispatch = useBackgroundDispatch()
  const keyringImport = useBackgroundSelector(
    (state) => state.keyrings.importing
  )

  const history = useHistory()

  useEffect(() => {
    if (areKeyringsUnlocked && keyringImport === "done" && isImporting) {
      setIsImporting(false)
      history.push(nextPage)
    }
  }, [history, areKeyringsUnlocked, keyringImport, nextPage, isImporting])

  const importWallet = useCallback(async () => {
    const trimmedRecoveryPhrase = recoveryPhrase.trim()
    if (isValidMnemonic(trimmedRecoveryPhrase)) {
      setIsImporting(true)
      dispatch(importLegacyKeyring({ mnemonic: trimmedRecoveryPhrase, path }))
    } else {
      setErrorMessage("Invalid recovery phrase")
    }
  }, [dispatch, recoveryPhrase, path])

  useEffect(() => {
    if (!isChecked) setPath(undefined)
  }, [isChecked])

  if (!areKeyringsUnlocked) return <></>

  return (
    <section className="center_horizontal standard_width">
      <div className="content">
        <div className="back_button_wrap">
          <SharedBackButton />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            importWallet()
          }}
        >
          <div className="portion top">
            <div className="metamask_onboarding_image" />
            <h1 className="serif_header">Import account</h1>
            <div className="info">
              Enter or copy & paste the recovery phrase from your MetaMask
              account.
            </div>
            <TextArea
              value={recoveryPhrase}
              onChange={(value) => {
                // Clear error message on change
                setErrorMessage("")
                setRecoveryPhrase(value)
              }}
              errorMessage={errorMessage}
            />

            {!HIDE_IMPORT_DERIVATION_PATH && (
              <div className="checkbox_wrapper">
                <SharedCheckbox
                  label="Custom derivation"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                />
              </div>
            )}
            {!HIDE_IMPORT_DERIVATION_PATH && isChecked && (
              <div className="select_wrapper">
                <SharedSelect
                  placement="top"
                  placeholder="Select derivation path"
                  options={derivationPaths}
                  onChange={setPath}
                />
              </div>
            )}
          </div>
          <div className="portion bottom">
            <SharedButton
              size="medium"
              type="primary"
              isDisabled={isImporting}
              onClick={importWallet}
            >
              Import account
            </SharedButton>
          </div>
        </form>
      </div>
      <style jsx>{`
        section {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          background-color: var(--hunter-green);
        }
        .content {
          animation: fadeIn ease 200ms;
          width: inherit;
        }
        .back_button_wrap {
          position: fixed;
          top: 25px;
        }
        h1 {
          margin: unset;
        }
        .portion {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bottom {
          height: 90px;
          justify-content: space-between;
          flex-direction: column;
          margin-bottom: 24px;
          margin-top: 35px;
        }
        .metamask_onboarding_image {
          background: url("./images/illustration_import_seed@2x.png");
          background-size: cover;
          width: ${HIDE_IMPORT_DERIVATION_PATH ? "205.3px" : "154px"};
          height: ${HIDE_IMPORT_DERIVATION_PATH ? "193px" : "144.75"};
          margin-top: 27px;
          margin-bottom: 13px;
        }
        .info {
          width: 313px;
          height: 43px;
          color: var(--green-60);
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          text-align: center;
          margin-bottom: 32px;
        }
        .checkbox_wrapper {
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .select_wrapper {
          width: 332px;
        }
      `}</style>
    </section>
  )
}
