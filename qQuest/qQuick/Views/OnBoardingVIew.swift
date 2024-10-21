import SwiftUI

struct OnboardingView: View {
    @State private var navigateToCustomTabBar = false
    @StateObject private var coinbaseRepo = CoinbaseRepo()
    
    var body: some View {
        VStack(alignment: .leading) {
            Spacer()

            Text("Welcome to qQuest")
                .font(.title3)
                .foregroundColor(.blue)
                .padding(.bottom, 10)
            
            Text("P2P interest-free funding circles for crypto")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Keep your assets, get liquidity")
                .font(.body)
                .foregroundColor(.gray)
                .padding(.top, 10)
            
            Spacer()
            
            // Button to trigger navigation
            Button(action: {
                Task {
                                    try await coinbaseRepo.connectToCoinbase()
                                }
                // Trigger navigation to CustomTabBar
                navigateToCustomTabBar = true
            }) {
                Text("Connect to Coinbase Wallet")
                    .font(.headline)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
            
            Text("By connecting, I accept the Terms & Conditions and Privacy Policy")
                .font(.caption)
                .foregroundColor(.gray)
                .frame(maxWidth: .infinity) // Match width with button
                .multilineTextAlignment(.center) // Center align the text
                .padding(.top, 10)
        }
        .padding()
        .background(Color.black.edgesIgnoringSafeArea(.all))
        
        // Navigation logic
        .fullScreenCover(isPresented: $navigateToCustomTabBar) {
            CustomTabBar()
        }
    }
}

struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView()
    }
}
