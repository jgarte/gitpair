import { bold } from 'chalk'
import pairingConfig from '../config/pairing'
import run from '../utils/run'
import formatEmailAddress from '../utils/format-email-address'
import stripCoAuthorship from '../utils/strip-co-authorship'
import log from '../utils/gitpair-prefixed-log'
import coAuthoringTrailers from '../utils/co-authoring-trailers'

export default () => {
  if (process.env.GITPAIR_RUNNING) {
    return
  }

  if (!pairingConfig.enabled) {
    log("👤 As pairing is not enabled, there's nothing to do.")
    return
  }

  if (pairingConfig.coAuthors.length === 0) {
    log("👤 As you're not pairing with anyone, there's nothing to do.")
    return
  }

  const me = {
    name: run('git config --get user.name'),
    email: run('git config --get user.email'),
  }

  const { coAuthors } = pairingConfig
  const trailers = coAuthoringTrailers(coAuthors)
  const rawCommitMessage = stripCoAuthorship(run('git log -1 --pretty=%B'))
  const author = formatEmailAddress(me)
  const command = `GITPAIR_RUNNING=1 git commit --amend -m"${rawCommitMessage}\n\n${trailers}"`

  log(bold('Rewriting last commit with the following info:'))
  log(trailers)
  run(command)
  log(bold('👥 Last commit was rewritten! 😎'))
}
