import { eslintCompatPlugin } from "@oxlint/plugins";
import { rule } from "./rule.ts";

export default eslintCompatPlugin({
  rules: { dependencies: rule },
});
