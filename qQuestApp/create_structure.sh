#!/bin/bash

# Create main directories
mkdir -p src/{components/{common},screens/{circles},hooks,utils,theme,navigation,store/{actions,reducers}}

# Create files in components
touch src/components/{CircleProgressIndicator.js,WalletConnectButton.js,ReputationScore.js,CircleCard.js,AssetCard.js}
touch src/components/common/{Button.js,Input.js,ProgressBar.js,Card.js}

# Create files in screens
touch src/screens/{HomeScreen.tsx,MainFeedScreen.tsx,NameInputScreen.tsx}
touch src/screens/circles/{CreateCircleScreen.tsx,JoinCircleScreen.js,CircleDetailsScreen.js,CircleManagementScreen.js}

# Create files in hooks
touch src/hooks/{useCircle.js,useReputation.js,useWallet.js}

# Create files in utils
touch src/utils/{constants.js,helpers.js,web3Helpers.js}

# Create files in theme
touch src/theme/{colors.js,fonts.js,spacing.js}

# Create files in navigation
touch src/navigation/{AppNavigator.js,MainTabNavigator.js}

# Create files in store
touch src/store/actions/{walletActions.js,userActions.js,circleActions.js}
touch src/store/reducers/index.js

# Create root files
touch App.tsx
touch index.js

echo "Updated folder structure created successfully!"