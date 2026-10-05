import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { withWheelMakerReader } from "./quartz/wheelmaker/reader.mjs"

const config = await loadQuartzConfig()
export default config
export const layout = withWheelMakerReader(await loadQuartzLayout())
