//
//  DashboardView.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI

struct DashboardView: View {
    var body: some View {
        VStack {
            Text("Dashboard Content Goes Here")
                .foregroundColor(.white)
        }
        .navigationBarTitle("qQuick")
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
    }
}
