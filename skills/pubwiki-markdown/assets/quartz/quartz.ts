import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import { withWheelMakerReader } from "./quartz/wheelmaker/reader.mjs"
import { withWheelMakerResources } from "./quartz/wheelmaker/resources.mjs"

const config = await loadQuartzConfig()
export const layout = withWheelMakerReader(await loadQuartzLayout())

// The YAML loader already created a dispatcher with its own layout. Replace it
// so page rendering and resource collection both use our completed reader layout.
config.plugins.emitters = config.plugins.emitters.map((emitter) =>
  emitter.name === "PageTypeDispatcher" ? PageTypeDispatcher(layout) : emitter,
)
export default withWheelMakerResources(config)
