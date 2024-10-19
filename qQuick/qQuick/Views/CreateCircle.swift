//
//  CreateCircle.swift
//  qQuick
//
//  Created by Hani Atta on 19/10/24.
//

import SwiftUI

struct CreateCircleView: View {
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var leadTime: Date = Date()
    @State private var repaymentDuration: Date = Date()
    @State private var amount: Double = 1000
    @State private var collateral: Double = 0.7
    
    var body: some View {
        VStack {
            Form {
                Section(header: Text("Create new circle")) {
                    TextField("Title (e.g. Buy sneakers)", text: $title)
                    
                    TextField("Description", text: $description)
                    
                    DatePicker("Lead time", selection: $leadTime, displayedComponents: .date)
                    
                    DatePicker("Repayment Duration", selection: $repaymentDuration, displayedComponents: .date)
                    
                    VStack(alignment: .leading) {
                        Text("Amount: $\(Int(amount))")
                        Slider(value: $amount, in: 100...5000, step: 100)
                    }
                    
                    
                    HStack{
                        VStack(alignment: .leading) {
                            Text("Collateral")
                            Text("\(Double(amount / 2600 ) * 1.4, specifier: "%.3f") ETH ($\(Int(amount * 1.4)))")
                        }
                        Spacer()
                        Text("$\(Int(amount))")
                            .font(.headline)
                                            .foregroundColor(.white)
                                            .padding(.vertical, 8)
                                            .padding(.horizontal, 16)
                                            .background(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .stroke(Color.gray, lineWidth: 1)
                                            )
                        
                    }
                }
                
                // Create Circle Button
                Button(action: {
                    // Add your action for creating the circle
                    print("Circle Created with Title: \(title)")
                }) {
                    Text("Create Circle")
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            
        }
        .navigationTitle("Create Circle")
    }
}

struct CreateCircleView_Previews: PreviewProvider {
    static var previews: some View {
        CreateCircleView()
    }
}
